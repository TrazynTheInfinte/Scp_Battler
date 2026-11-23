import { getAbility, type Ability, type AbilityContext } from './abilities'
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
import type { TypeName } from './typeChart'
import { typeEffectiveness } from './typeChart'

export interface StepResult {
  state: BattleState
  events: BattleEvent[]
}

const SIDES: readonly SideIndex[] = [0, 1]

/**
 * A battle still going after this turn ends by remaining HP: the side with
 * the higher share of its team's total max HP left wins; equal is a draw.
 * Guarantees termination (e.g. two healers that out-heal each other).
 */
export const TURN_LIMIT = 100

const STAGEABLE: readonly StageableStat[] = ['atk', 'def', 'spa', 'spd', 'spe']
const ZERO_STAGES: StatStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
const FRESH_VOLATILES: Volatiles = { adaptedType: null, watched: false, enteredTurn: 0, hitBoosts: 0 }

/**
 * Used automatically once an SCP has no PP left in any move: always x1
 * effectiveness, and the user takes recoil of STRUGGLE_RECOIL of its max HP.
 */
export const STRUGGLE: MoveData = {
  id: 'struggle',
  name: 'Struggle',
  type: 'Kinetic',
  category: 'Physical',
  power: 50,
  accuracy: null,
  pp: 0,
  typeless: true,
}
export const STRUGGLE_RECOIL = 1 / 4

/** Mid-point of the damage roll, used for expected-damage estimates. */
export const AVERAGE_ROLL = (MIN_ROLL + MAX_ROLL) / 2

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/**
 * Build the initial battle state after Team Preview: both teams (species ids,
 * in team order), each side's chosen starting SCP, and the RNG seed.
 *
 * This does NOT run the leads' switch-in abilities; use `startBattle` for a
 * real battle. `createBattle` exists for tests and tooling that need the raw
 * state.
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
      team: teams[side].map((id) => newCombatant(dex, species(dex, id))),
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

/** Start a battle: create it, then run both leads' switch-in abilities (faster first). */
export function startBattle(
  dex: Dex,
  teams: readonly [readonly string[], readonly string[]],
  leads: readonly [number, number],
  seed: number,
): StepResult {
  const s = createBattle(dex, teams, leads, seed)
  const rng = createRng(s.rngState)
  const events: BattleEvent[] = []
  for (const side of orderBySpeed(s, SIDES, rng)) runSwitchIn(s, dex, side, rng, events)
  s.rngState = rng.state
  return { state: s, events }
}

/** A fresh, full-HP level-50 combatant (e.g. for AI matchup estimates). */
export function createCombatant(dex: Dex, speciesId: string): Combatant {
  return newCombatant(dex, species(dex, speciesId))
}

function newCombatant(dex: Dex, sp: SpeciesData): Combatant {
  getAbility(dex, sp.ability) // fail fast on an unknown ability id
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
    pp: sp.moves.map((id) => moveData(dex, id).pp),
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

/** True once an SCP has no PP left in any move: whatever move it picks, it uses Struggle. */
export function isStruggling(c: Combatant): boolean {
  return c.pp.every((n) => n <= 0)
}

/**
 * True if `user`'s attacking moves fail against `target` (an SCP with
 * Unobserved facing an Ever Watchful one). Status moves still work.
 */
export function attacksBlocked(dex: Dex, user: Combatant, target: Combatant): boolean {
  return Boolean(abilityOf(dex, user)?.frozenWhileWatched && abilityOf(dex, target)?.watchesOpponent)
}

/**
 * Every legal Choice for a side in the 'choose' phase (empty otherwise).
 * Moves need PP left; once every move is out, any move index is legal and
 * means Struggle.
 */
export function legalChoices(state: BattleState, side: SideIndex): Choice[] {
  if (state.phase !== 'choose') return []
  const active = activeOf(state, side)
  const moves: Choice[] = [0, 1, 2, 3]
    .filter((i) => isStruggling(active) || active.pp[i] > 0)
    .map((moveIndex) => ({ kind: 'move', moveIndex }))
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
 * Order: switches (faster outgoing SCP first, each followed by its switch-in
 * ability) -> moves (ability priority, then faster active first; an SCP
 * Neutralized before acting does nothing) -> end of turn (faster first) ->
 * outcome. Speed ties are a coin flip.
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
    switchIn(s, side, choice.teamIndex, s.turn)
    events.push({ type: 'switch', side, from, to: choice.teamIndex })
    runSwitchIn(s, dex, side, rng, events)
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
  endOfTurn(s, dex, rng, events, watchedNext)

  s.rngState = rng.state
  finishStep(s, events)
  return { state: s, events }
}

/**
 * During the 'replace' phase: each side that needs one sends in a new active
 * (a team index); sides that don't must pass null. Replacements enter in
 * order of the incoming SCPs' Speed, each followed by its switch-in ability.
 */
export function resolveReplacements(
  state: BattleState,
  dex: Dex,
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
  const rng = createRng(s.rngState)
  const events: BattleEvent[] = []

  const replacing = SIDES.filter((side) => picks[side] !== null)
  const incomingSpeed = (side: SideIndex) => speedOf(s.sides[side].team[picks[side] as number])
  const ordered =
    replacing.length < 2 || incomingSpeed(0) !== incomingSpeed(1)
      ? [...replacing].sort((a, b) => incomingSpeed(b) - incomingSpeed(a))
      : rng.chance(0.5)
        ? [0, 1]
        : [1, 0]

  for (const side of ordered as SideIndex[]) {
    const pick = picks[side] as number
    switchIn(s, side, pick, s.turn + 1)
    events.push({ type: 'replace', side, to: pick })
    runSwitchIn(s, dex, side, rng, events)
  }
  s.needsReplacement = [false, false]
  s.phase = 'choose'
  s.turn += 1
  s.rngState = rng.state
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

function abilityOf(dex: Dex, c: Combatant): Ability | null {
  return getAbility(dex, species(dex, c.speciesId).ability)
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

/**
 * Move order: an ability granting priority beats Speed (unless the opponent's
 * ability suppresses it); otherwise by Speed.
 */
function orderMovers(
  s: BattleState,
  dex: Dex,
  sides: readonly SideIndex[],
  rng: Rng,
  events: BattleEvent[],
): SideIndex[] {
  if (sides.length < 2) return [...sides]
  const priority = (side: SideIndex): string | null => {
    const c = activeOf(s, side)
    const ability = abilityOf(dex, c)
    if (!ability?.movesFirst?.(c)) return null
    const opposing = abilityOf(dex, activeOf(s, other(side)))
    if (opposing?.watchesOpponent) {
      events.push({ type: 'ability', side: other(side), abilityId: opposing.id })
      return null
    }
    return ability.id
  }
  const [a, b] = sides
  const pa = priority(a)
  const pb = priority(b)
  if ((pa === null) !== (pb === null)) {
    const first = pa !== null ? a : b
    events.push({ type: 'ability', side: first, abilityId: (pa ?? pb) as string })
    return [first, other(first)]
  }
  return orderBySpeed(s, sides, rng)
}

function switchIn(
  s: BattleState,
  side: SideIndex,
  teamIndex: number,
  enteredTurn: number,
): void {
  const sideState = s.sides[side]
  // Stat stages and volatiles are cleared when an SCP leaves the field.
  // Status conditions persist.
  for (const c of [sideState.team[sideState.active], sideState.team[teamIndex]]) {
    c.stages = { ...ZERO_STAGES }
    c.volatiles = { ...FRESH_VOLATILES }
  }
  sideState.team[teamIndex].volatiles.enteredTurn = enteredTurn
  sideState.active = teamIndex
}

function runSwitchIn(s: BattleState, dex: Dex, side: SideIndex, rng: Rng, events: BattleEvent[]) {
  const ability = abilityOf(dex, activeOf(s, side))
  ability?.onSwitchIn?.(abilityContext(s, dex, side, ability, rng, events))
}

/**
 * One side's action. Returns true if the move actually used was a Status move
 * (for SCP-173's Unobserved). RNG is consumed in a fixed order so lockstep
 * clients stay in sync: stun check, amnesia check(s), accuracy, crit, roll,
 * ability reactions, then effect chances in listed order.
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

  const struggling = isStruggling(user)
  let moveIndex = chosenIndex
  if (user.status?.name === 'Amnesiac') {
    const left = (user.status.turnsLeft ?? 1) - 1
    if (left <= 0) {
      user.status = null
      events.push({ type: 'statusEnded', side, status: 'Amnesiac' })
    } else {
      user.status.turnsLeft = left
      if (!struggling && rng.chance(AMNESIA_RANDOM_MOVE_CHANCE)) {
        // A random move that still has PP.
        const usable = user.pp.flatMap((n, i) => (n > 0 ? [i] : []))
        moveIndex = usable[rng.int(0, usable.length - 1)]
        events.push({ type: 'amnesia', side })
      }
    }
  }

  const move = struggling ? STRUGGLE : moveData(dex, userSpecies.moves[moveIndex])
  const isStatusMove = move.category === 'Status'
  const targetSide = other(side)

  if (!isStatusMove && attacksBlocked(dex, user, activeOf(s, targetSide))) {
    const watcher = abilityOf(dex, activeOf(s, targetSide)) as Ability
    events.push({ type: 'ability', side: targetSide, abilityId: watcher.id })
    events.push({ type: 'frozen', side })
    return false
  }

  events.push({ type: 'move', side, moveId: move.id })
  if (!struggling) user.pp[moveIndex] -= 1

  if (move.accuracy !== null && rng.int(1, 100) > move.accuracy) {
    events.push({ type: 'miss', side })
    return isStatusMove
  }

  if (isStatusMove) {
    if (!applyEffects(s, dex, side, move, rng, events)) events.push({ type: 'noEffect', side })
    return true
  }

  const target = activeOf(s, targetSide)
  const targetAbility = abilityOf(dex, target)

  const crit = rng.chance(CRIT_CHANCE)
  const { damage, effectiveness } = damageFor(dex, s.level, user, target, move, crit, rng.int(MIN_ROLL, MAX_ROLL))

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
    if (move === STRUGGLE) struggleRecoil(s, side, events)
    return false
  }

  if (targetAbility?.afterDamagedByMove) {
    targetAbility.afterDamagedByMove(
      abilityContext(s, dex, targetSide, targetAbility, rng, events),
      move,
    )
  }

  applyEffects(s, dex, side, move, rng, events)
  if (move === STRUGGLE) struggleRecoil(s, side, events)
  return false
}

function struggleRecoil(s: BattleState, side: SideIndex, events: BattleEvent[]): void {
  const user = activeOf(s, side)
  if (isNeutralized(user)) return // e.g. already Neutralized by the target's retaliation
  const amount = Math.min(user.hp, Math.max(1, Math.floor(user.stats.hp * STRUGGLE_RECOIL)))
  user.hp -= amount
  events.push({ type: 'recoil', side, amount, hpAfter: user.hp })
  if (isNeutralized(user)) events.push({ type: 'neutralized', side, teamIndex: s.sides[side].active })
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
        if (changeStages(s, dex, who, effect.changes, effect.who === 'target', events)) changed = true
        break
      }
      case 'heal': {
        if (heal(s, side, effect.percent / 100, events)) changed = true
        break
      }
      case 'cure': {
        const user = activeOf(s, side)
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

/**
 * Apply stage changes to `side`'s active, clamped to +-6. `byOpponent` marks
 * changes caused by the other side, which some abilities block (drops only).
 */
function changeStages(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  changes: Partial<StatStages>,
  byOpponent: boolean,
  events: BattleEvent[],
): boolean {
  const c = activeOf(s, side)
  if (isNeutralized(c)) return false
  const ability = abilityOf(dex, c)
  let changed = false
  let blocked = false
  for (const stat of STAGEABLE) {
    const requested = changes[stat]
    if (!requested) continue
    if (requested < 0 && byOpponent && ability?.blocksOpponentStatDrops) {
      blocked = true
      continue
    }
    const next = Math.max(MIN_STAGE, Math.min(MAX_STAGE, c.stages[stat] + requested))
    const delta = next - c.stages[stat]
    if (delta === 0) continue
    c.stages[stat] = next
    events.push({ type: 'stage', side, stat, delta })
    changed = true
  }
  if (blocked && ability) events.push({ type: 'ability', side, abilityId: ability.id })
  return changed
}

function heal(s: BattleState, side: SideIndex, fraction: number, events: BattleEvent[]): boolean {
  const c = activeOf(s, side)
  const missing = c.stats.hp - c.hp
  if (isNeutralized(c) || missing <= 0) return false
  const amount = Math.min(missing, Math.max(1, Math.floor(c.stats.hp * fraction)))
  c.hp += amount
  events.push({ type: 'heal', side, amount, hpAfter: c.hp })
  return true
}

/** Damage one hit would do, with every modifier the engine applies. */
function damageFor(
  dex: Dex,
  level: number,
  user: Combatant,
  target: Combatant,
  move: MoveData,
  crit: boolean,
  roll: number,
): { damage: number; effectiveness: number } {
  const userSpecies = species(dex, user.speciesId)
  const targetSpecies = species(dex, target.speciesId)
  const { attack, defense } = attackAndDefense(user, target, move, crit)
  const effectiveness = move.typeless ? 1 : typeEffectiveness(move.type, targetSpecies.types)
  const abilityMultiplier =
    (getAbility(dex, targetSpecies.ability)?.incomingDamageMultiplier?.(target, move) ?? 1) *
    (getAbility(dex, userSpecies.ability)?.outgoingDamageMultiplier?.(user, target, move) ?? 1)
  const damage = computeDamage({
    level,
    power: move.power,
    attack,
    defense,
    sameType: !move.typeless && (userSpecies.types as readonly string[]).includes(move.type),
    effectiveness,
    abilityMultiplier,
    crit,
    roll,
  })
  return { damage, effectiveness }
}

/**
 * Average damage of one hit (no crit, mid roll, ignoring accuracy), with all
 * type, stage, and ability modifiers. 0 for Status moves. For AI estimates.
 */
export function expectedDamage(
  dex: Dex,
  user: Combatant,
  target: Combatant,
  move: MoveData,
  level: number = LEVEL,
): number {
  if (move.category === 'Status') return 0
  return damageFor(dex, level, user, target, move, false, AVERAGE_ROLL).damage
}

/** Whether `c` could receive `status` right now (no current status, not immune). */
export function canReceiveStatus(dex: Dex, c: Combatant, status: StatusName): boolean {
  if (isNeutralized(c) || c.status) return false
  const sp = species(dex, c.speciesId)
  if (isImmuneToStatus(sp.types, status)) return false
  return !getAbility(dex, sp.ability)?.statusImmunities?.includes(status)
}

function canInflict(s: BattleState, dex: Dex, side: SideIndex, status: StatusName): boolean {
  return canReceiveStatus(dex, activeOf(s, side), status)
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
  if (!canInflict(s, dex, side, status)) return false
  const turnsLeft =
    status === 'Amnesiac'
      ? rng.int(AMNESIAC_MIN_TURNS, AMNESIAC_MAX_TURNS)
      : status === 'Contained'
        ? CONTAINED_TURNS
        : null
  activeOf(s, side).status = { name: status, turnsLeft }
  events.push({ type: 'status', side, status })
  return true
}

function abilityContext(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  ability: Ability,
  rng: Rng,
  events: BattleEvent[],
): AbilityContext {
  const sideOf = (who: 'self' | 'opponent'): SideIndex => (who === 'self' ? side : other(side))
  return {
    self: activeOf(s, side),
    opponent: activeOf(s, other(side)),
    rng,
    announce(typeName?: TypeName) {
      events.push({ type: 'ability', side, abilityId: ability.id, ...(typeName ? { typeName } : {}) })
    },
    changeStages: (who, changes) =>
      changeStages(s, dex, sideOf(who), changes, who === 'opponent', events),
    clearBoosts(who) {
      const target = sideOf(who)
      const c = activeOf(s, target)
      if (isNeutralized(c)) return false
      let changed = false
      for (const stat of STAGEABLE) {
        if (c.stages[stat] <= 0) continue
        events.push({ type: 'stage', side: target, stat, delta: -c.stages[stat] })
        c.stages[stat] = 0
        changed = true
      }
      return changed
    },
    canInflict: (who, status) => canInflict(s, dex, sideOf(who), status),
    inflictStatus: (who, status) => inflictStatus(s, dex, sideOf(who), status, rng, events),
    heal: (who, fraction) => heal(s, sideOf(who), fraction, events),
    damage(who, fraction) {
      const target = sideOf(who)
      const c = activeOf(s, target)
      if (isNeutralized(c)) return false
      const amount = Math.min(c.hp, Math.max(1, Math.floor(c.stats.hp * fraction)))
      c.hp -= amount
      events.push({ type: 'abilityDamage', side: target, amount, hpAfter: c.hp })
      if (isNeutralized(c)) events.push({ type: 'neutralized', side: target, teamIndex: s.sides[target].active })
      return true
    },
  }
}

/**
 * End of turn, faster active first. For each: status damage (Bleeding 1/8,
 * Contained 1/16, min 1), then Contained counts down, then its end-of-turn
 * ability. Finally record which actives are "watched" next turn.
 */
function endOfTurn(
  s: BattleState,
  dex: Dex,
  rng: Rng,
  events: BattleEvent[],
  watchedNext: readonly [boolean, boolean],
): void {
  const alive = SIDES.filter((side) => !isNeutralized(activeOf(s, side)))
  for (const side of orderBySpeed(s, alive, rng)) {
    const c = activeOf(s, side)
    // An earlier side's end-of-turn ability may have Neutralized this one.
    if (isNeutralized(c)) continue
    const status = c.status
    if (status && (status.name === 'Bleeding' || status.name === 'Contained')) {
      const fraction = status.name === 'Bleeding' ? BLEED_FRACTION : CONTAINED_FRACTION
      const amount = Math.min(c.hp, Math.max(1, Math.floor(c.stats.hp * fraction)))
      c.hp -= amount
      events.push({ type: 'residual', side, status: status.name, amount, hpAfter: c.hp })
      if (isNeutralized(c)) {
        events.push({ type: 'neutralized', side, teamIndex: s.sides[side].active })
        continue
      }
    }
    if (status?.name === 'Contained') {
      const left = (status.turnsLeft ?? 1) - 1
      if (left <= 0) {
        c.status = null
        events.push({ type: 'statusEnded', side, status: 'Contained' })
      } else {
        status.turnsLeft = left
      }
    }
    const ability = abilityOf(dex, c)
    ability?.onEndOfTurn?.(abilityContext(s, dex, side, ability, rng, events))
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

/** Turn-limit result: higher share of total team HP remaining wins; equal is a draw. */
export function timeoutWinner(state: BattleState): SideIndex | 'draw' {
  const totals = SIDES.map((side) =>
    state.sides[side].team.reduce(
      (t, c) => ({ hp: t.hp + Math.max(0, c.hp), max: t.max + c.stats.hp }),
      { hp: 0, max: 0 },
    ),
  )
  // Compare hp0/max0 vs hp1/max1 without floating point.
  const a = totals[0].hp * totals[1].max
  const b = totals[1].hp * totals[0].max
  return a === b ? 'draw' : a > b ? 0 : 1
}

/** After a turn: end the battle, ask for replacements, or open the next turn. */
function finishStep(s: BattleState, events: BattleEvent[]): void {
  let outcome = checkOutcome(s)
  if (outcome === null && s.turn >= TURN_LIMIT) {
    events.push({ type: 'timeout' })
    outcome = timeoutWinner(s)
  }
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
      pp: [...c.pp],
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
