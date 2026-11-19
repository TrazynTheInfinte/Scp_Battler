import { getAbility } from './abilities'
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
  StageableStat,
  StatStages,
  StatusName,
  Volatiles,
} from './model'
import { createRng, type Rng } from './rng'
import { LEVEL, MAX_STAGE, MIN_STAGE, calcStat, effectiveStat } from './stats'
import {
  AMNESIAC_MAX_TURNS,
  AMNESIAC_MIN_TURNS,
  AMNESIA_RANDOM_MOVE_CHANCE,
  BLEED_FRACTION,
  CONTAINED_FRACTION,
  CONTAINED_TURNS,
  STUN_SKIP_CHANCE,
  STUN_SPEED_MULTIPLIER,
  isImmuneToStatus,
} from './status'
import { validateTeam } from './team'
import { typeEffectiveness } from './typeChart'

export interface StepResult {
  state: BattleState
  events: BattleEvent[]
}

const SIDES: readonly SideIndex[] = [0, 1]

const STAGEABLE: readonly StageableStat[] = ['atk', 'def', 'spa', 'spd', 'spe']
const ZERO_STAGES: StatStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
const FRESH_VOLATILES: Volatiles = { adaptedType: null, watched: false }

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
  getAbility(sp.ability) // fail fast on an unknown ability id
  const b = sp.baseStats
  const stats = {
    hp: calcStat('hp', b.hp),
    atk: calcStat('atk', b.atk),
    def: calcStat('def', b.def),
    spa: calcStat('spa', b.spa),
    spd: calcStat('spd', b.spd),
    spe: calcStat('spe', b.spe),
  }
  return {
    speciesId: sp.id,
    hp: stats.hp,
    stats,
    stages: { ...ZERO_STAGES },
    status: null,
    volatiles: { ...FRESH_VOLATILES },
  }
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

/** Speed including stages and Stunned. */
export function speedOf(c: Combatant): number {
  const mult = c.status?.name === 'Stunned' ? STUN_SPEED_MULTIPLIER : 1
  return Math.floor(effectiveStat(c, 'spe') * mult)
}

/** Team indices a side could bring in (healthy, not the current active). */
export function switchTargets(state: BattleState, side: SideIndex): number[] {
  const s = state.sides[side]
  return s.team.flatMap((c, i) => (i !== s.active && !isNeutralized(c) ? [i] : []))
}

/** Every legal Choice for a side in the 'choose' phase (empty otherwise). */
export function legalChoices(state: BattleState, side: SideIndex): Choice[] {
  if (state.phase !== 'choose') return []
  const moves: Choice[] = [0, 1, 2, 3].map((moveIndex) => ({ kind: 'move', moveIndex }))
  if (activeOf(state, side).status?.name === 'Contained') return moves
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
 * Order: switches (faster outgoing SCP first) -> moves (ability priority,
 * then faster active first; an SCP Neutralized before acting does nothing)
 * -> end of turn (faster first) -> outcome. Speed ties are a coin flip.
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

  // 2. Moves, ordered by whoever is active now (after switches).
  const usedStatusMove: [boolean, boolean] = [false, false]
  const movers = SIDES.filter((side) => choices[side].kind === 'move')
  for (const side of orderMovers(s, dex, movers, rng, events)) {
    if (isNeutralized(activeOf(s, side))) continue
    const choice = choices[side] as Extract<Choice, { kind: 'move' }>
    usedStatusMove[side] = executeMove(s, dex, side, choice.moveIndex, rng, events)
  }

  // 3. End of turn. An SCP that switched in this turn is not "watched" on its
  // first turn on the field, even if the opponent used a Status move.
  const watchedNext: [boolean, boolean] = [
    usedStatusMove[1] && !switchers.includes(0),
    usedStatusMove[0] && !switchers.includes(1),
  ]
  endOfTurn(s, rng, events, watchedNext)

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
  const sa = speedOf(activeOf(s, a))
  const sb = speedOf(activeOf(s, b))
  if (sa === sb) return rng.chance(0.5) ? [a, b] : [b, a]
  return sa > sb ? [a, b] : [b, a]
}

/** Move order: an ability granting priority beats Speed; otherwise by Speed. */
function orderMovers(
  s: BattleState,
  dex: Dex,
  sides: readonly SideIndex[],
  rng: Rng,
  events: BattleEvent[],
): SideIndex[] {
  if (sides.length < 2) return [...sides]
  const priorityAbility = (side: SideIndex): string | null => {
    const c = activeOf(s, side)
    const ability = getAbility(species(dex, c.speciesId).ability)
    return ability?.movesFirst?.(c) ? ability.id : null
  }
  const [a, b] = sides
  const pa = priorityAbility(a)
  const pb = priorityAbility(b)
  if ((pa === null) !== (pb === null)) {
    const first = pa !== null ? a : b
    events.push({ type: 'ability', side: first, abilityId: (pa ?? pb) as string })
    return [first, other(first)]
  }
  return orderBySpeed(s, sides, rng)
}

function switchIn(s: BattleState, side: SideIndex, teamIndex: number): void {
  const sideState = s.sides[side]
  // Stat stages and volatiles are cleared when an SCP leaves the field.
  // Status conditions persist.
  for (const c of [sideState.team[sideState.active], sideState.team[teamIndex]]) {
    c.stages = { ...ZERO_STAGES }
    c.volatiles = { ...FRESH_VOLATILES }
  }
  sideState.active = teamIndex
}

/**
 * One side's action. Returns true if the move actually used was a Status move
 * (for SCP-173's Unobserved). RNG is consumed in a fixed order so lockstep
 * clients stay in sync: stun check, amnesia check(s), accuracy, crit, roll,
 * then effect chances in listed order.
 */
function executeMove(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  chosenIndex: number,
  rng: Rng,
  events: BattleEvent[],
): boolean {
  const user = activeOf(s, side)
  const userSpecies = species(dex, user.speciesId)

  if (user.status?.name === 'Stunned' && rng.chance(STUN_SKIP_CHANCE)) {
    events.push({ type: 'stunned', side })
    return false
  }

  let moveIndex = chosenIndex
  if (user.status?.name === 'Amnesiac') {
    const left = (user.status.turnsLeft ?? 1) - 1
    if (left <= 0) {
      user.status = null
      events.push({ type: 'statusEnded', side, status: 'Amnesiac' })
    } else {
      user.status.turnsLeft = left
      if (rng.chance(AMNESIA_RANDOM_MOVE_CHANCE)) {
        moveIndex = rng.int(0, 3)
        events.push({ type: 'amnesia', side })
      }
    }
  }

  const move = moveData(dex, userSpecies.moves[moveIndex])
  const isStatusMove = move.category === 'Status'
  events.push({ type: 'move', side, moveId: move.id })

  if (move.accuracy !== null && rng.int(1, 100) > move.accuracy) {
    events.push({ type: 'miss', side })
    return isStatusMove
  }

  const targetSide = other(side)

  if (isStatusMove) {
    if (!applyEffects(s, dex, side, move, rng, events)) events.push({ type: 'noEffect', side })
    return true
  }

  const target = activeOf(s, targetSide)
  const targetSpecies = species(dex, target.speciesId)
  const targetAbility = getAbility(targetSpecies.ability)

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
    abilityMultiplier: targetAbility?.incomingDamageMultiplier?.(target, move.type) ?? 1,
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
    return false
  }

  if (targetAbility?.afterDamagedByMove?.(target, move.type)) {
    events.push({ type: 'ability', side: targetSide, abilityId: targetAbility.id, typeName: move.type })
  }

  applyEffects(s, dex, side, move, rng, events)
  return false
}

/** Apply a move's extra effects. Returns true if anything changed. */
function applyEffects(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  move: MoveData,
  rng: Rng,
  events: BattleEvent[],
): boolean {
  const user = activeOf(s, side)
  const targetSide = other(side)
  let changed = false
  const rolls = (chance: number) => chance >= 100 || rng.chance(chance / 100)

  for (const effect of move.effects ?? []) {
    switch (effect.kind) {
      case 'status': {
        if (!rolls(effect.chance)) break
        if (inflictStatus(s, dex, targetSide, effect.status, rng, events)) changed = true
        break
      }
      case 'stages': {
        if (!rolls(effect.chance)) break
        const who = effect.who === 'user' ? side : targetSide
        const c = activeOf(s, who)
        for (const stat of STAGEABLE) {
          const requested = effect.changes[stat]
          if (!requested) continue
          const next = Math.max(MIN_STAGE, Math.min(MAX_STAGE, c.stages[stat] + requested))
          const delta = next - c.stages[stat]
          if (delta === 0) continue
          c.stages[stat] = next
          events.push({ type: 'stage', side: who, stat, delta })
          changed = true
        }
        break
      }
      case 'heal': {
        const missing = user.stats.hp - user.hp
        if (missing <= 0) break
        const amount = Math.min(missing, Math.max(1, Math.floor((user.stats.hp * effect.percent) / 100)))
        user.hp += amount
        events.push({ type: 'heal', side, amount, hpAfter: user.hp })
        changed = true
        break
      }
      case 'cure': {
        if (!user.status) break
        events.push({ type: 'statusEnded', side, status: user.status.name })
        user.status = null
        changed = true
        break
      }
    }
  }
  return changed
}

/** Fails (returns false) if the target already has a status or is immune. */
function inflictStatus(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  status: StatusName,
  rng: Rng,
  events: BattleEvent[],
): boolean {
  const target = activeOf(s, side)
  if (target.status) return false
  if (isImmuneToStatus(species(dex, target.speciesId).types, status)) return false
  const turnsLeft =
    status === 'Amnesiac'
      ? rng.int(AMNESIAC_MIN_TURNS, AMNESIAC_MAX_TURNS)
      : status === 'Contained'
        ? CONTAINED_TURNS
        : null
  target.status = { name: status, turnsLeft }
  events.push({ type: 'status', side, status })
  return true
}

/**
 * End of turn, faster active first: status damage (Bleeding 1/8, Contained
 * 1/16, min 1), then Contained counts down. Finally record which actives are
 * "watched" next turn.
 */
function endOfTurn(
  s: BattleState,
  rng: Rng,
  events: BattleEvent[],
  watchedNext: readonly [boolean, boolean],
): void {
  const alive = SIDES.filter((side) => !isNeutralized(activeOf(s, side)))
  for (const side of orderBySpeed(s, alive, rng)) {
    const c = activeOf(s, side)
    const status = c.status
    if (!status) continue
    if (status.name === 'Bleeding' || status.name === 'Contained') {
      const fraction = status.name === 'Bleeding' ? BLEED_FRACTION : CONTAINED_FRACTION
      const amount = Math.min(c.hp, Math.max(1, Math.floor(c.stats.hp * fraction)))
      c.hp -= amount
      events.push({ type: 'residual', side, status: status.name, amount, hpAfter: c.hp })
      if (isNeutralized(c)) {
        events.push({ type: 'neutralized', side, teamIndex: s.sides[side].active })
        continue
      }
    }
    if (status.name === 'Contained') {
      const left = (status.turnsLeft ?? 1) - 1
      if (left <= 0) {
        c.status = null
        events.push({ type: 'statusEnded', side, status: 'Contained' })
      } else {
        status.turnsLeft = left
      }
    }
  }

  for (const side of SIDES) {
    activeOf(s, side).volatiles.watched = watchedNext[side]
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
    team: side.team.map((c) => ({
      ...c,
      stats: { ...c.stats },
      stages: { ...c.stages },
      status: c.status ? { ...c.status } : null,
      volatiles: { ...c.volatiles },
    })),
  })
  return {
    ...state,
    sides: [cloneSide(state.sides[0]), cloneSide(state.sides[1])],
    needsReplacement: [...state.needsReplacement],
  }
}
