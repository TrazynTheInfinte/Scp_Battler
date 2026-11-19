import { CRIT_CHANCE, MAX_ROLL, MIN_ROLL, computeDamage } from './damage'
import type {
  BattleEvent,
  BattleState,
  Choice,
  Combatant,
  Dex,
  MoveData,
  SideIndex,
  SideState,
  SpeciesData,
  StatStages,
} from './model'
import { createRng, type Rng } from './rng'
import { LEVEL, calcStat, effectiveStat } from './stats'
import { validateTeam } from './team'
import { typeEffectiveness } from './typeChart'

export interface StepResult {
  state: BattleState
  events: BattleEvent[]
}

const SIDES: readonly SideIndex[] = [0, 1]

const ZERO_STAGES: StatStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/**
 * Start a battle after Team Preview: both teams (species ids, in team order),
 * each side's chosen starting SCP, and the RNG seed.
 */
export function createBattle(
  dex: Dex,
  teams: readonly [readonly string[], readonly string[]],
  leads: readonly [number, number],
  seed: number,
): BattleState {
  const sides = SIDES.map((side) => {
    const problems = validateTeam(dex, teams[side])
    if (problems.length > 0) {
      throw new Error(`side ${side} team is illegal: ${JSON.stringify(problems)}`)
    }
    const lead = leads[side]
    if (!Number.isInteger(lead) || lead < 0 || lead >= teams[side].length) {
      throw new RangeError(`side ${side} lead index ${lead} out of range`)
    }
    return {
      team: teams[side].map((id) => newCombatant(species(dex, id))),
      active: lead,
    }
  }) as [SideState, SideState]

  return {
    level: LEVEL,
    turn: 1,
    phase: 'choose',
    sides,
    needsReplacement: [false, false],
    winner: null,
    rngState: seed >>> 0,
  }
}

function newCombatant(sp: SpeciesData): Combatant {
  const b = sp.baseStats
  const stats = {
    hp: calcStat('hp', b.hp),
    atk: calcStat('atk', b.atk),
    def: calcStat('def', b.def),
    spa: calcStat('spa', b.spa),
    spd: calcStat('spd', b.spd),
    spe: calcStat('spe', b.spe),
  }
  return { speciesId: sp.id, hp: stats.hp, stats, stages: { ...ZERO_STAGES } }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function activeOf(state: BattleState, side: SideIndex): Combatant {
  const s = state.sides[side]
  return s.team[s.active]
}

export function isNeutralized(c: Combatant): boolean {
  return c.hp <= 0
}

/** Team indices a side could switch to (healthy, not the current active). */
export function switchTargets(state: BattleState, side: SideIndex): number[] {
  const s = state.sides[side]
  return s.team.flatMap((c, i) => (i !== s.active && !isNeutralized(c) ? [i] : []))
}

/** Every legal Choice for a side in the 'choose' phase (empty otherwise). */
export function legalChoices(state: BattleState, side: SideIndex): Choice[] {
  if (state.phase !== 'choose') return []
  const moves: Choice[] = [0, 1, 2, 3].map((moveIndex) => ({ kind: 'move', moveIndex }))
  const switches: Choice[] = switchTargets(state, side).map((teamIndex) => ({
    kind: 'switch',
    teamIndex,
  }))
  return [...moves, ...switches]
}

function isLegal(state: BattleState, side: SideIndex, choice: Choice): boolean {
  return legalChoices(state, side).some((c) =>
    c.kind === 'move'
      ? choice.kind === 'move' && choice.moveIndex === c.moveIndex
      : choice.kind === 'switch' && choice.teamIndex === c.teamIndex,
  )
}

/** Win/draw check: a side with no healthy SCPs has lost; both at once is a draw. */
export function checkOutcome(state: BattleState): SideIndex | 'draw' | null {
  const defeated = SIDES.map((side) => state.sides[side].team.every(isNeutralized))
  if (defeated[0] && defeated[1]) return 'draw'
  if (defeated[0]) return 1
  if (defeated[1]) return 0
  return null
}

// ---------------------------------------------------------------------------
// Turn resolution
// ---------------------------------------------------------------------------

/**
 * Resolve one turn from both sides' choices. Pure: returns a new state.
 *
 * Order: switches (faster outgoing SCP first) -> moves (faster active first;
 * an SCP Neutralized before acting does nothing) -> end of turn -> outcome.
 * Speed ties are a coin flip from the battle RNG.
 */
export function resolveTurn(
  state: BattleState,
  dex: Dex,
  choices: readonly [Choice, Choice],
): StepResult {
  if (state.phase !== 'choose') throw new Error(`cannot resolve a turn in phase '${state.phase}'`)
  for (const side of SIDES) {
    if (!isLegal(state, side, choices[side])) {
      throw new Error(`illegal choice for side ${side}: ${JSON.stringify(choices[side])}`)
    }
  }

  const s = cloneState(state)
  const rng = createRng(s.rngState)
  const events: BattleEvent[] = []

  // 1. Switches.
  const switchers = SIDES.filter((side) => choices[side].kind === 'switch')
  for (const side of orderBySpeed(s, switchers, rng)) {
    const choice = choices[side] as Extract<Choice, { kind: 'switch' }>
    const from = s.sides[side].active
    switchIn(s, side, choice.teamIndex)
    events.push({ type: 'switch', side, from, to: choice.teamIndex })
  }

  // 2. Moves, by the Speed of whoever is active now (after switches).
  const movers = SIDES.filter((side) => choices[side].kind === 'move')
  for (const side of orderBySpeed(s, movers, rng)) {
    if (isNeutralized(activeOf(s, side))) continue
    const choice = choices[side] as Extract<Choice, { kind: 'move' }>
    executeMove(s, dex, side, choice.moveIndex, rng, events)
  }

  // 3. End of turn (residual effects arrive with status conditions).

  s.rngState = rng.state
  finishStep(s, events)
  return { state: s, events }
}

/**
 * During the 'replace' phase: each side that needs one sends in a new active
 * (a team index); sides that don't must pass null.
 */
export function resolveReplacements(
  state: BattleState,
  picks: readonly [number | null, number | null],
): StepResult {
  if (state.phase !== 'replace') {
    throw new Error(`cannot resolve replacements in phase '${state.phase}'`)
  }
  for (const side of SIDES) {
    const pick = picks[side]
    if (state.needsReplacement[side]) {
      if (pick === null || !switchTargets(state, side).includes(pick)) {
        throw new Error(`illegal replacement for side ${side}: ${pick}`)
      }
    } else if (pick !== null) {
      throw new Error(`side ${side} does not need a replacement`)
    }
  }

  const s = cloneState(state)
  const events: BattleEvent[] = []
  for (const side of SIDES) {
    const pick = picks[side]
    if (pick === null) continue
    switchIn(s, side, pick)
    events.push({ type: 'replace', side, to: pick })
  }
  s.needsReplacement = [false, false]
  s.phase = 'choose'
  s.turn += 1
  return { state: s, events }
}

/** A side gives up. Allowed at any point before the battle ends. */
export function forfeit(state: BattleState, side: SideIndex): StepResult {
  if (state.phase === 'ended') throw new Error('battle already ended')
  const s = cloneState(state)
  const winner: SideIndex = side === 0 ? 1 : 0
  s.phase = 'ended'
  s.winner = winner
  s.needsReplacement = [false, false]
  return {
    state: s,
    events: [
      { type: 'forfeit', side },
      { type: 'end', winner },
    ],
  }
}

// ---------------------------------------------------------------------------
// Internals (all mutate the already-cloned working state `s`)
// ---------------------------------------------------------------------------

function species(dex: Dex, id: string): SpeciesData {
  const sp = dex.species[id]
  if (!sp) throw new Error(`unknown species '${id}'`)
  return sp
}

function moveData(dex: Dex, id: string): MoveData {
  const m = dex.moves[id]
  if (!m) throw new Error(`unknown move '${id}'`)
  return m
}

function other(side: SideIndex): SideIndex {
  return side === 0 ? 1 : 0
}

/** Faster first; a Speed tie is a coin flip. Only consumes RNG on a tie. */
function orderBySpeed(s: BattleState, sides: readonly SideIndex[], rng: Rng): SideIndex[] {
  if (sides.length < 2) return [...sides]
  const [a, b] = sides
  const sa = effectiveStat(activeOf(s, a), 'spe')
  const sb = effectiveStat(activeOf(s, b), 'spe')
  if (sa === sb) return rng.chance(0.5) ? [a, b] : [b, a]
  return sa > sb ? [a, b] : [b, a]
}

function switchIn(s: BattleState, side: SideIndex, teamIndex: number): void {
  const sideState = s.sides[side]
  // Stat stages are cleared when an SCP leaves the field.
  sideState.team[sideState.active].stages = { ...ZERO_STAGES }
  sideState.active = teamIndex
}

/**
 * RNG consumption order per move is fixed (accuracy, crit, roll) so lockstep
 * clients stay in sync.
 */
function executeMove(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  moveIndex: number,
  rng: Rng,
  events: BattleEvent[],
): void {
  const user = activeOf(s, side)
  const userSpecies = species(dex, user.speciesId)
  const move = moveData(dex, userSpecies.moves[moveIndex])
  const targetSide = other(side)
  const target = activeOf(s, targetSide)
  const targetSpecies = species(dex, target.speciesId)

  events.push({ type: 'move', side, moveId: move.id })

  if (move.accuracy !== null && rng.int(1, 100) > move.accuracy) {
    events.push({ type: 'miss', side })
    return
  }

  if (move.category === 'Status') {
    // Status move effects arrive with stat stages / status conditions.
    events.push({ type: 'noEffect', side })
    return
  }

  const crit = rng.chance(CRIT_CHANCE)
  const { attack, defense } = attackAndDefense(user, target, move, crit)
  const effectiveness = typeEffectiveness(move.type, targetSpecies.types)
  const damage = computeDamage({
    level: s.level,
    power: move.power,
    attack,
    defense,
    sameType: (userSpecies.types as readonly string[]).includes(move.type),
    effectiveness,
    crit,
    roll: rng.int(MIN_ROLL, MAX_ROLL),
  })

  const dealt = Math.min(damage, target.hp)
  target.hp -= dealt
  events.push({
    type: 'damage',
    side: targetSide,
    amount: dealt,
    hpAfter: target.hp,
    effectiveness,
    crit,
  })
  if (isNeutralized(target)) {
    events.push({ type: 'neutralized', side: targetSide, teamIndex: s.sides[targetSide].active })
  }
}

/**
 * Effective attacking/defending stats for a move. A critical hit ignores the
 * attacker's stat drops and the defender's stat boosts.
 */
export function attackAndDefense(
  user: Combatant,
  target: Combatant,
  move: MoveData,
  crit: boolean,
): { attack: number; defense: number } {
  const physical = move.category === 'Physical'
  const atkStat = physical ? 'atk' : 'spa'
  const defStat = physical ? 'def' : 'spd'
  const atkStage = crit ? Math.max(0, user.stages[atkStat]) : user.stages[atkStat]
  const defStage = crit ? Math.min(0, target.stages[defStat]) : target.stages[defStat]
  return {
    attack: effectiveStat(user, atkStat, atkStage),
    defense: effectiveStat(target, defStat, defStage),
  }
}

/** After a turn: end the battle, ask for replacements, or open the next turn. */
function finishStep(s: BattleState, events: BattleEvent[]): void {
  const outcome = checkOutcome(s)
  if (outcome !== null) {
    s.phase = 'ended'
    s.winner = outcome
    s.needsReplacement = [false, false]
    events.push({ type: 'end', winner: outcome })
    return
  }
  const needs: [boolean, boolean] = [
    isNeutralized(activeOf(s, 0)),
    isNeutralized(activeOf(s, 1)),
  ]
  if (needs[0] || needs[1]) {
    s.phase = 'replace'
    s.needsReplacement = needs
  } else {
    s.turn += 1
  }
}

function cloneState(state: BattleState): BattleState {
  const cloneSide = (side: SideState): SideState => ({
    active: side.active,
    team: side.team.map((c) => ({ ...c, stats: { ...c.stats }, stages: { ...c.stages } })),
  })
  return {
    ...state,
    sides: [cloneSide(state.sides[0]), cloneSide(state.sides[1])],
    needsReplacement: [...state.needsReplacement],
  }
}
