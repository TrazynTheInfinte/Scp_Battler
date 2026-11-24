import {
  forfeit,
  resolveReplacements,
  resolveTurn,
  startBattle,
  type BattleState,
  type Choice,
  type Dex,
  type SideIndex,
  type StepResult,
  type TeamEquipment,
} from '../engine'

/**
 * Lockstep online battles (docs/adr/0002): both players' browsers run the
 * engine themselves from the same setup and the same shared log of
 * decisions, so they compute the same battle. Nothing here touches Firebase.
 *
 * The battle is a sequence of decision points, numbered from 0. At each, the
 * seats that must act (both, for a turn; only those replacing, for a
 * replacement) each record one Decision under that number. Once every needed
 * seat has recorded one, both browsers resolve it.
 */

/** A seat in a Room: 0 created it, 1 joined. Seat n plays engine side n. */
export type Seat = SideIndex

/** What both players agreed on before the first turn. */
export interface MatchSetup {
  seed: number
  teams: readonly [readonly string[], readonly string[]]
  equipment: TeamEquipment
  leads: readonly [number, number]
}

/** One seat's input at a decision point: a turn Choice, or a replacement pick. */
export type Decision = Choice | { kind: 'replace'; teamIndex: number }

const PREFIX = { move: 'm', switch: 's', replace: 'r' } as const

/** e.g. 'm2' (move 2), 's4' (switch to team member 4), 'r1' (replace with 1). */
export function encodeDecision(d: Decision): string {
  return `${PREFIX[d.kind]}${d.kind === 'move' ? d.moveIndex : d.teamIndex}`
}

export function decodeDecision(raw: unknown): Decision | null {
  if (typeof raw !== 'string') return null
  const m = /^([msr])([0-5])$/.exec(raw)
  if (!m) return null
  const n = Number(m[2])
  if (m[1] === 'm') return n <= 3 ? { kind: 'move', moveIndex: n } : null
  return { kind: m[1] === 's' ? 'switch' : 'replace', teamIndex: n }
}

/** How a battle ended other than by play. `atStep`: decision points applied before it took effect. */
export type Outcome =
  /** `seat` gave up. */
  | { kind: 'forfeit'; seat: Seat; atStep: number }
  /** `seat` was disconnected past the grace period. */
  | { kind: 'abandoned'; seat: Seat; atStep: number }
  /** The two browsers disagreed about the battle (or one sent nonsense): nobody wins. */
  | { kind: 'noContest' }

/** The shared log: decisions[k][seat] is that seat's encoded Decision at point k. */
export interface MatchLog {
  decisions: readonly (readonly [string | null, string | null])[]
  outcome: Outcome | null
}

/** The seats that must decide in this state. */
export function seatsToAct(state: BattleState): Seat[] {
  if (state.phase === 'choose') return [0, 1]
  if (state.phase === 'replace') return ([0, 1] as const).filter((s) => state.needsReplacement[s])
  return []
}

/** One applied decision point (or the closing forfeit), for display. */
export interface Applied {
  before: BattleState
  result: StepResult
}

export interface SyncResult {
  /** Newly applied steps, in order. */
  steps: Applied[]
  /** True if the battle had to be replayed from the start (an outcome landed before steps already shown). */
  reset: boolean
  /** A decision in the log was malformed or illegal: the match can't continue. */
  invalid: boolean
}

/** A cheap fingerprint of a battle state, compared between browsers after each step. */
export function hashState(state: BattleState): string {
  const text = JSON.stringify(state)
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export class Match {
  readonly start: StepResult
  state: BattleState
  /** Decision points applied so far (= the number of the one being decided now). */
  applied = 0
  /** True once the outcome (forfeit/abandon) has been applied. */
  private outcomeApplied = false

  private readonly dex: Dex

  constructor(dex: Dex, setup: MatchSetup) {
    this.dex = dex
    this.start = startBattle(dex, setup.teams, setup.leads, setup.seed, setup.equipment)
    this.state = this.start.state
  }

  /** Whether `seat` must record a decision for the current point. */
  needs(seat: Seat): boolean {
    return seatsToAct(this.state).includes(seat)
  }

  /** Apply every decision point the log completes, then any outcome. */
  sync(log: MatchLog): SyncResult {
    const outcome = log.outcome
    let reset = false
    if (outcome && outcome.kind !== 'noContest' && outcome.atStep < this.applied) {
      // A forfeit/abandon recorded at an earlier point than we've shown: rebuild up to it.
      this.state = this.start.state
      this.applied = 0
      this.outcomeApplied = false
      reset = true
    }
    const steps: Applied[] = []
    const stopAt = outcome && outcome.kind !== 'noContest' ? outcome.atStep : Infinity
    while (this.state.phase !== 'ended' && this.applied < stopAt && outcome?.kind !== 'noContest') {
      const entry = log.decisions[this.applied]
      const needed = seatsToAct(this.state)
      if (!entry || needed.some((seat) => entry[seat] === null)) break
      const step = this.resolve(needed.map((seat) => [seat, decodeDecision(entry[seat])] as const))
      if (!step) return { steps, reset, invalid: true }
      steps.push(step)
      this.state = step.result.state
      this.applied++
    }
    if (
      outcome &&
      outcome.kind !== 'noContest' &&
      !this.outcomeApplied &&
      this.applied === outcome.atStep &&
      this.state.phase !== 'ended'
    ) {
      const result = forfeit(this.state, outcome.seat)
      steps.push({ before: this.state, result })
      this.state = result.state
      this.outcomeApplied = true
    }
    return { steps, reset, invalid: false }
  }

  private resolve(decisions: (readonly [Seat, Decision | null])[]): Applied | null {
    const before = this.state
    try {
      if (before.phase === 'choose') {
        const choices = [null, null] as [Choice | null, Choice | null]
        for (const [seat, d] of decisions) {
          if (!d || d.kind === 'replace') return null
          choices[seat] = d
        }
        return { before, result: resolveTurn(before, this.dex, choices as [Choice, Choice]) }
      }
      const picks: [number | null, number | null] = [null, null]
      for (const [seat, d] of decisions) {
        if (!d || d.kind !== 'replace') return null
        picks[seat] = d.teamIndex
      }
      return { before, result: resolveReplacements(before, this.dex, picks) }
    } catch {
      return null // the engine rejected an illegal decision
    }
  }
}
