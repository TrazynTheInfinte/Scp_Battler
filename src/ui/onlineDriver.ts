import { ROSTER } from '../data/roster'
import type { BattleEvent, BattleState, Choice } from '../engine'
import { Match, encodeDecision, hashState, type Applied, type Seat } from '../online/lockstep'
import { recordOutcome, submitDecision, submitHash } from '../online/room'
import { hashMismatch, matchSetup, type RoomData } from '../online/roomData'
import type { Step } from './battleController'
import type { BattleDriver, BattleView, DriverListener, DriverStatus } from './battleDriver'
import { HOSTILE, PLAYER, formatEvents } from './battleLog'
import { mirrorEvent, mirrorState } from './mirror'

const NO_CONTEST = {
  mismatch: 'Your two games stopped agreeing on what happened, so the battle was called off.',
  invalid: "Your opponent's game sent a move this game doesn't allow, so the battle was called off.",
} as const

/**
 * An online battle in a Room (docs/adr/0002): this browser runs the real
 * battle from the Room's shared log and shows it from its own seat's side.
 * The Online screen feeds it every Room change through `update`.
 */
export class OnlineDriver implements BattleDriver {
  readonly initial: BattleView
  readonly opponent: string
  private readonly code: string
  private readonly seat: Seat
  private readonly match: Match
  private room: RoomData
  private log: string[]
  private listener: DriverListener | null = null
  private status: DriverStatus = { kind: 'ready' }
  private noContest: string | null = null
  private awayDeadline: number | null = null
  /** The decision point this seat has recorded a decision for, if not yet resolved. */
  private submitted: number | null = null
  private hashed = -1
  /** Something changed while nobody was listening (between creation and the screen subscribing). */
  private missed = false

  constructor(code: string, seat: Seat, room: RoomData) {
    const setup = matchSetup(room)
    if (!setup) throw new Error('both players must pick leads first')
    this.code = code
    this.seat = seat
    this.room = room
    this.opponent = room.seats[seat === 0 ? 1 : 0]?.callsign ?? 'Opponent'
    this.match = new Match(ROSTER, setup)
    this.log = this.introLines()
    this.sync()
    this.initial = { state: this.view(this.match.state), log: this.log }
    this.refreshStatus()
  }

  listen(listener: DriverListener) {
    this.listener = listener
    listener.status(this.status)
    if (this.missed) listener.advance([], { state: this.view(this.match.state), log: this.log })
    this.missed = false
    return () => {
      this.listener = null
    }
  }

  /** Decision points applied so far, for recording a forfeit or abandon at the right point. */
  get applied() {
    return this.match.applied
  }

  update(room: RoomData) {
    this.room = room
    const steps = this.sync()
    if (steps && this.listener) this.listener.advance(steps, { state: this.view(this.match.state), log: this.log })
    else if (steps) this.missed = true
    this.refreshStatus()
  }

  /** The opponent's connection dropped (deadline to return), or came back (null). */
  setAway(deadline: number | null) {
    this.awayDeadline = deadline
    this.refreshStatus()
  }

  choose(choice: Choice) {
    this.decide(encodeDecision(choice))
  }

  replace(teamIndex: number) {
    this.decide(encodeDecision({ kind: 'replace', teamIndex }))
  }

  forfeit() {
    void recordOutcome(this.code, { kind: 'forfeit', seat: this.seat, atStep: this.match.applied })
  }

  private decide(encoded: string) {
    if (!this.match.needs(this.seat) || this.submitted !== null || this.noContest) return
    const step = this.match.applied
    this.submitted = step
    this.refreshStatus()
    void submitDecision(this.code, step, this.seat, encoded).then((ok) => {
      if (ok || this.match.applied !== step) return
      this.submitted = null // didn't get through (offline?): let the player try again
      this.refreshStatus()
    })
  }

  /** Apply what the log completes; returns the new steps for display (null if nothing changed). */
  private sync(): Step[] | null {
    if (this.noContest) return null
    if (this.room.log.outcome?.kind === 'noContest') {
      this.noContest ??= NO_CONTEST.mismatch
      return null
    }
    const r = this.match.sync(this.room.log)
    if (r.invalid) return this.callOff(NO_CONTEST.invalid)
    if (this.submitted !== null && this.match.applied > this.submitted) this.submitted = null
    // Already decided this point (e.g. before a reload)? Then we're waiting, not choosing.
    if (this.match.needs(this.seat) && this.room.log.decisions[this.match.applied]?.[this.seat]) {
      this.submitted = this.match.applied
    }

    // Compare fingerprints: write ours for the latest point, then check both.
    const latest = this.match.applied - 1
    if (latest > this.hashed && !this.room.log.outcome) {
      this.hashed = latest
      void submitHash(this.code, latest, this.seat, hashState(this.match.state))
    }
    if (hashMismatch(this.room) !== null) return this.callOff(NO_CONTEST.mismatch)

    if (r.reset) {
      this.log = [...this.introLines(), ...this.replayLines()]
      return []
    }
    if (r.steps.length === 0) return null
    const steps = r.steps.map((a) => this.toStep(a))
    this.log = [...this.log, ...steps.flatMap((s) => s.lines)]
    return steps
  }

  private callOff(reason: string): null {
    this.noContest = reason
    void recordOutcome(this.code, { kind: 'noContest' })
    return null
  }

  private refreshStatus() {
    const next: DriverStatus = this.noContest
      ? { kind: 'noContest', reason: this.noContest }
      : this.match.state.phase === 'ended'
        ? { kind: 'ready' }
        : this.awayDeadline !== null
          ? { kind: 'opponentAway', deadline: this.awayDeadline }
          : this.submitted !== null || !this.match.needs(this.seat)
            ? { kind: 'waiting' }
            : { kind: 'ready' }
    if (JSON.stringify(next) === JSON.stringify(this.status)) return
    this.status = next
    this.listener?.status(next)
  }

  // --- the view from this seat ---

  private view(s: BattleState): BattleState {
    return this.seat === 0 ? s : mirrorState(s)
  }

  private events(events: readonly BattleEvent[]): BattleEvent[] {
    return this.seat === 0 ? [...events] : events.map(mirrorEvent)
  }

  private toStep({ before, result }: Applied): Step {
    const events = this.events(result.events)
    return {
      before: this.view(before),
      events,
      after: this.view(result.state),
      lines: formatEvents(this.view(before), events, ROSTER),
    }
  }

  private introLines(): string[] {
    const start = this.view(this.match.start.state)
    const name = (side: 0 | 1) => ROSTER.species[start.sides[side].team[start.sides[side].active].speciesId].name
    return [
      `${this.opponent} deployed ${name(HOSTILE)}.`,
      `You deployed ${name(PLAYER)}.`,
      ...formatEvents(start, this.events(this.match.start.events), ROSTER),
    ]
  }

  /** Every step from the start, for rebuilding the log after a reset. */
  private replayLines(): string[] {
    const fresh = new Match(ROSTER, matchSetup(this.room)!)
    return fresh.sync(this.room.log).steps.flatMap((a) => this.toStep(a).lines)
  }
}
