import { chooseAction, chooseLead, chooseReplacement } from '../ai'
import {
  createRng,
  forfeit,
  resolveReplacements,
  resolveTurn,
  startBattle,
  type BattleEvent,
  type BattleState,
  type Choice,
  type Dex,
  type Rng,
  type StepResult,
  type TeamEquipment,
} from '../engine'
import { HOSTILE, PLAYER, formatEvents } from './battleLog'

/** One engine step, kept for playback: the state before, what happened, and the state after. */
export interface Step {
  before: BattleState
  events: BattleEvent[]
  after: BattleState
  lines: string[]
}

/** A single-player battle: the player is side 0, the AI is side 1. */
export interface Session {
  dex: Dex
  state: BattleState
  /** The AI's own RNG (never the battle's, see docs/adr/0001). Mutated as the AI decides. */
  aiRng: Rng
  log: string[]
}

export interface Advance {
  session: Session
  /** Steps produced by this action, in order (for animated playback). */
  steps: Step[]
}

export function startSession(
  dex: Dex,
  playerTeam: readonly string[],
  aiTeam: readonly string[],
  playerLead: number,
  seed: number,
  /** [player's, AI's] Equipment, each aligned with its team. */
  equipment: TeamEquipment = [[], []],
): Advance {
  const aiRng = createRng((seed ^ 0x9e3779b9) >>> 0)
  const aiLead = chooseLead(dex, aiTeam, playerTeam, aiRng, equipment[1], equipment[0])
  const started = startBattle(dex, [playerTeam, aiTeam], [playerLead, aiLead], seed, equipment)
  // Leads' switch-in abilities (e.g. Boot Sequence) are the start step's events.
  const step = toStep(dex, started.state, started)
  const lines = [...createSessionIntro(dex, started.state), ...step.lines]
  const session: Session = { dex, state: started.state, aiRng, log: lines }
  return { session, steps: [{ ...step, lines }] }
}

/** The player's turn choice; the AI picks its own, then any AI-only replacement is handled. */
export function playerTurn(session: Session, choice: Choice): Advance {
  const aiChoice = chooseAction(session.state, session.dex, HOSTILE, session.aiRng)
  const step = toStep(session.dex, session.state, resolveTurn(session.state, session.dex, [choice, aiChoice]))
  return continueWithAi(session, [step])
}

/** The player's replacement pick (only valid when the player needs one). */
export function playerReplace(session: Session, teamIndex: number): Advance {
  const s = session.state
  const aiPick = s.needsReplacement[HOSTILE] ? chooseReplacement(s, session.dex, HOSTILE, session.aiRng) : null
  const step = toStep(session.dex, s, resolveReplacements(s, session.dex, [teamIndex, aiPick]))
  return continueWithAi(session, [step])
}

export function playerForfeit(session: Session): Advance {
  const step = toStep(session.dex, session.state, forfeit(session.state, PLAYER))
  return continueWithAi(session, [step])
}

/** Whether the battle is waiting on the player to pick a replacement. */
export function playerMustReplace(state: BattleState): boolean {
  return state.phase === 'replace' && state.needsReplacement[PLAYER]
}

function continueWithAi(session: Session, steps: Step[]): Advance {
  let state = steps[steps.length - 1].after
  // If only the AI needs a replacement, it picks immediately.
  if (state.phase === 'replace' && !state.needsReplacement[PLAYER]) {
    const pick = chooseReplacement(state, session.dex, HOSTILE, session.aiRng)
    const step = toStep(session.dex, state, resolveReplacements(state, session.dex, [null, pick]))
    steps.push(step)
    state = step.after
  }
  return {
    session: { ...session, state, log: [...session.log, ...steps.flatMap((s) => s.lines)] },
    steps,
  }
}

export function toStep(dex: Dex, before: BattleState, result: StepResult): Step {
  return { before, events: result.events, after: result.state, lines: formatEvents(before, result.events, dex) }
}

function createSessionIntro(dex: Dex, s: BattleState): string[] {
  const name = (side: 0 | 1) => dex.species[s.sides[side].team[s.sides[side].active].speciesId].name
  return [`The hostile site deployed ${name(HOSTILE)}.`, `You deployed ${name(PLAYER)}.`]
}
