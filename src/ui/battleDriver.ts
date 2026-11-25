import { STRUGGLE, activeOf, combatantMove, isStruggling, moveName, type BattleState, type Choice } from '../engine'
import { HOSTILE } from './battleLog'
import { playerForfeit, playerReplace, playerTurn, type Advance, type Session, type Step } from './battleController'

/**
 * What the Battle screen plays against: the AI, or a person online. The
 * screen always sees itself as side 0 (an online player on side 1 gets a
 * mirrored view) and doesn't care which it is.
 */
export interface BattleDriver {
  /** The battle as it stands when the screen opens. */
  readonly initial: BattleView
  /** Shown as the opponent's name. */
  readonly opponent: string
  /** Names the opponent in log lines (see formatEvents); absent: "Hostile". */
  readonly hostileTag?: string
  /** The Trainer's announced move for the turn being chosen, as text; null when there is none. */
  plan?(): string | null
  /** Receive each advance (to animate) and status change. Returns a function that stops listening. */
  listen(listener: DriverListener): () => void
  choose(choice: Choice): void
  replace(teamIndex: number): void
  forfeit(): void
  /** Tutorial only: the current hint and what the player may do (null: no hint, anything goes). */
  guide?(): Guide | null
}

/** A tutorial step: a hint, and the one action it allows (or any). */
export interface Guide {
  text: string
  allow:
    | { kind: 'any' }
    | { kind: 'move'; moveIndex: number }
    /** Tap Switch, then this team member. */
    | { kind: 'switch'; teamIndex: number }
}

export interface BattleView {
  state: BattleState
  log: string[]
}

export type DriverStatus =
  /** Waiting on the player. */
  | { kind: 'ready' }
  /** The player has decided; waiting on the opponent. */
  | { kind: 'waiting' }
  /** The opponent's connection dropped; they lose at `deadline` (ms timestamp) unless they return. */
  | { kind: 'opponentAway'; deadline: number }
  /** The battle can't continue and nobody wins. */
  | { kind: 'noContest'; reason: string }

export interface DriverListener {
  advance(steps: Step[], view: BattleView): void
  status(status: DriverStatus): void
}

/** Single-player: the AI answers instantly, on this device. */
export function aiDriver(session: Session): BattleDriver {
  let current = session
  let listener: DriverListener | null = null
  const push = (adv: Advance) => {
    current = adv.session
    listener?.advance(adv.steps, { state: adv.session.state, log: adv.session.log })
  }
  return {
    initial: { state: session.state, log: session.log },
    opponent: session.opponent?.name ?? 'The hostile site',
    hostileTag: session.opponent?.tag,
    plan: () => planText(current),
    listen(l) {
      listener = l
      return () => {
        listener = null
      }
    },
    choose: (choice) => push(playerTurn(current, choice)),
    replace: (teamIndex) => push(playerReplace(current, teamIndex)),
    forfeit: () => push(playerForfeit(current)),
  }
}

/** "Trainer will use Neck Snap." / "Trainer will switch to SCP-096." for the Trainer's plan; null otherwise. */
export function planText(session: Session): string | null {
  const plan = session.plan
  if (!plan || session.state.phase !== 'choose') return null
  const who = session.opponent?.tag ?? 'The opponent'
  const active = activeOf(session.state, HOSTILE)
  if (plan.kind === 'switch') {
    return `${who} will switch to ${session.dex.species[session.state.sides[HOSTILE].team[plan.teamIndex].speciesId].name}.`
  }
  const moveId = session.dex.species[active.speciesId].moves[plan.moveIndex]
  const move = isStruggling(active) ? STRUGGLE : combatantMove(session.dex, active, moveId)
  return `${who} will use ${moveName(session.dex, active.speciesId, move)}.`
}
