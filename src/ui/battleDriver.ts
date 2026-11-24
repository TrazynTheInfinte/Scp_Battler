import type { BattleState, Choice } from '../engine'
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
  /** Receive each advance (to animate) and status change. Returns a function that stops listening. */
  listen(listener: DriverListener): () => void
  choose(choice: Choice): void
  replace(teamIndex: number): void
  forfeit(): void
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
    opponent: 'The hostile site',
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
