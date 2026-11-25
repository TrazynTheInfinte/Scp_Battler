import { chooseAction, chooseLead, chooseReplacement } from '../ai'
import { chooseRandomAction, chooseRandomReplacement, type Opponent } from '../ai/opponents'
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
  /** Who the player faces. Absent: the standard AI, named "The hostile site". */
  opponent?: Opponent
  /** The Trainer's move for the turn being chosen, decided before the player picks and shown to them. */
  plan: Choice | null
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
  opponent?: Opponent,
): Advance {
  const aiRng = createRng((seed ^ 0x9e3779b9) >>> 0)
  const aiLead = chooseLead(dex, aiTeam, playerTeam, aiRng, equipment[1], equipment[0])
  const bent: [boolean, boolean] = [false, opponent?.kind === 'realityBender']
  const started = startBattle(dex, [playerTeam, aiTeam], [playerLead, aiLead], seed, equipment, { bent })
  // Leads' switch-in abilities (e.g. Boot Sequence) are the start step's events.
  const step = toStep(dex, started.state, started, opponent?.tag)
  const lines = [...createSessionIntro(dex, started.state, opponent), ...step.lines]
  const session = withPlan({ dex, state: started.state, aiRng, log: lines, opponent, plan: null })
  return { session, steps: [{ ...step, lines }] }
}

/** The player's turn choice; the AI picks its own (or keeps the Trainer's plan), then any AI-only replacement is handled. */
export function playerTurn(session: Session, choice: Choice): Advance {
  const aiChoice = session.plan ?? aiAction(session)
  const step = toStep(session.dex, session.state, resolveTurn(session.state, session.dex, [choice, aiChoice]), session.opponent?.tag)
  return continueWithAi(session, [step])
}

/** The player's replacement pick (only valid when the player needs one). */
export function playerReplace(session: Session, teamIndex: number): Advance {
  const s = session.state
  const aiPick = s.needsReplacement[HOSTILE] ? aiReplacement(session, s) : null
  const step = toStep(session.dex, s, resolveReplacements(s, session.dex, [teamIndex, aiPick]), session.opponent?.tag)
  return continueWithAi(session, [step])
}

export function playerForfeit(session: Session): Advance {
  const step = toStep(session.dex, session.state, forfeit(session.state, PLAYER), session.opponent?.tag)
  return continueWithAi(session, [step])
}

/** Whether the battle is waiting on the player to pick a replacement. */
export function playerMustReplace(state: BattleState): boolean {
  return state.phase === 'replace' && state.needsReplacement[PLAYER]
}

function aiAction(session: Session): Choice {
  return session.opponent?.kind === 'scientist'
    ? chooseRandomAction(session.state, HOSTILE, session.aiRng)
    : chooseAction(session.state, session.dex, HOSTILE, session.aiRng)
}

function aiReplacement(session: Session, state: BattleState): number {
  return session.opponent?.kind === 'scientist'
    ? chooseRandomReplacement(state, HOSTILE, session.aiRng)
    : chooseReplacement(state, session.dex, HOSTILE, session.aiRng)
}

/** The Trainer decides its next move as soon as a turn opens, so the player can see it. */
function withPlan(session: Session): Session {
  const planning = session.opponent?.kind === 'trainer' && session.state.phase === 'choose'
  return { ...session, plan: planning ? aiAction(session) : null }
}

function continueWithAi(session: Session, steps: Step[]): Advance {
  let state = steps[steps.length - 1].after
  // If only the AI needs a replacement, it picks immediately.
  if (state.phase === 'replace' && !state.needsReplacement[PLAYER]) {
    const pick = aiReplacement(session, state)
    const step = toStep(session.dex, state, resolveReplacements(state, session.dex, [null, pick]), session.opponent?.tag)
    steps.push(step)
    state = step.after
  }
  return {
    session: withPlan({ ...session, state, log: [...session.log, ...steps.flatMap((s) => s.lines)] }),
    steps,
  }
}

export function toStep(dex: Dex, before: BattleState, result: StepResult, hostileTag?: string): Step {
  return {
    before,
    events: result.events,
    after: result.state,
    lines: formatEvents(before, result.events, dex, hostileTag),
  }
}

function createSessionIntro(dex: Dex, s: BattleState, opponent?: Opponent): string[] {
  const name = (side: 0 | 1) => dex.species[s.sides[side].team[s.sides[side].active].speciesId].name
  return [`${opponent?.tag ?? 'The hostile site'} deployed ${name(HOSTILE)}.`, `You deployed ${name(PLAYER)}.`]
}
