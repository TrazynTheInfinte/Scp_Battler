import { equipmentFor, getAbility, getEquipment, type Ability, type AbilityContext } from './abilities'
import { CRIT_CHANCE, MAX_ROLL, MIN_ROLL, computeDamage } from './damage'
import type {
  BattleEvent,
  BattleState,
  Choice,
  Combatant,
  DelayedStrike,
  Dex,
  MoveData,
  SideIndex,
  SideState,
  SpeciesData,
  StageName,
  StatStages,
  Stats,
  StatusName,
  Volatiles,
} from './model'
import { createRng, type Rng } from './rng'
import { ACC_MAX_STAGE, ACC_MIN_STAGE, LEVEL, MAX_STAGE, MIN_STAGE, calcStat, effectiveAccuracy, effectiveStat } from './stats'
import {
  AMNESIAC_MAX_TURNS,
  AMNESIAC_MIN_TURNS,
  AMNESIA_RANDOM_MOVE_CHANCE,
  BLEED_FRACTION,
  BURN_FRACTION,
  BURN_PHYSICAL_MULTIPLIER,
  CONTAINED_FRACTION,
  CONTAINED_TURNS,
  RAD_FRACTION_STEP,
  RAD_MAX_STEPS,
  STUN_SKIP_CHANCE,
  STUN_SPEED_MULTIPLIER,
  isImmuneToStatus,
} from './status'
import { validateTeam } from './team'
import type { TypeName } from './typeChart'
import { counterType, typeEffectiveness } from './typeChart'

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

const STAGEABLE: readonly StageName[] = ['atk', 'def', 'spa', 'spd', 'spe', 'acc']
const ZERO_STAGES: StatStages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0 }
/** Fresh volatiles for an SCP entering the field with `hp` HP. */
const freshVolatiles = (hp: number): Volatiles => ({
  adaptedType: null,
  watched: false,
  enteredTurn: 0,
  hitBoosts: 0,
  withdrawing: false,
  lastMoveId: null,
  stacks: 0,
  hpTwoAgo: hp,
  hpOneAgo: hp,
  radTicks: 0,
})

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

/** Each side's Equipment ids, aligned with its team (null or missing = none). */
export type TeamEquipment = readonly [readonly (string | null)[], readonly (string | null)[]]

export interface BattleOptions {
  /** Per side: whether its team is Reality-bent (see Combatant.bent). */
  bent?: readonly [boolean, boolean]
}

const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const

/**
 * Swap a stat spread by rank: best with worst, 2nd with 5th, 3rd with 4th.
 * Ties keep HP-to-Speed order, so the result is deterministic.
 */
export function bendStats(stats: Stats): Stats {
  const ranked = [...STAT_KEYS].sort((a, b) => stats[b] - stats[a])
  const out = { ...stats }
  for (let i = 0; i < ranked.length; i++) out[ranked[i]] = stats[ranked[ranked.length - 1 - i]]
  return out
}

/** A freshly created combatant, Reality-bent: swapped stats (full HP), counter-typed moves. */
function bend(c: Combatant): Combatant {
  const stats = bendStats(c.stats)
  return { ...c, stats, hp: stats.hp, volatiles: freshVolatiles(stats.hp), bent: true }
}

/** The move as `c` uses it: a Reality-bent SCP's moves take their counter type. */
export function combatantMove(dex: Dex, c: Combatant, moveId: string): MoveData {
  const m = moveData(dex, moveId)
  if (!c.bent) return m
  const type = counterType(m.type)
  return type === m.type ? m : { ...m, type }
}

/**
 * Build the initial battle state after Team Preview: both teams (species ids,
 * in team order), each side's chosen starting SCP, the RNG seed, and each
 * side's Equipment.
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
  equipment: TeamEquipment = [[], []],
  options: BattleOptions = {},
): BattleState {
  const sides = SIDES.map((side) => {
    const problems = validateTeam(dex, teams[side], equipment[side])
    if (problems.length > 0) {
      throw new Error(`side ${side} team is illegal: ${JSON.stringify(problems)}`)
    }
    const lead = leads[side]
    if (!Number.isInteger(lead) || lead < 0 || lead >= teams[side].length) {
      throw new RangeError(`side ${side} lead index ${lead} out of range`)
    }
    return {
      team: teams[side].map((id, i) => {
        const c = newCombatant(dex, species(dex, id), equipment[side][i] ?? null)
        return options.bent?.[side] ? bend(c) : c
      }),
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
  equipment: TeamEquipment = [[], []],
  options: BattleOptions = {},
): StepResult {
  const s = createBattle(dex, teams, leads, seed, equipment, options)
  const rng = createRng(s.rngState)
  const events: BattleEvent[] = []
  for (const side of orderBySpeed(s, SIDES, rng)) runSwitchIn(s, dex, side, rng, events)
  s.rngState = rng.state
  return { state: s, events }
}

/** A fresh, full-HP level-50 combatant (e.g. for AI matchup estimates). */
export function createCombatant(dex: Dex, speciesId: string, equipment: string | null = null): Combatant {
  return newCombatant(dex, species(dex, speciesId), equipment)
}

function newCombatant(dex: Dex, sp: SpeciesData, equipment: string | null): Combatant {
  // Also fails fast on an unknown ability or Equipment id.
  const ppMultiplier = [getAbility(dex, sp.ability), getEquipment(dex, equipment)].reduce(
    (m, e) => m * (e?.ppMultiplier ?? 1),
    1,
  )
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
    equipment,
    hp: stats.hp,
    stats,
    stages: { ...ZERO_STAGES },
    pp: sp.moves.map((id) => Math.floor(moveData(dex, id).pp * ppMultiplier)),
    status: null,
    volatiles: freshVolatiles(stats.hp),
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
  return effectsOf(dex, user).some((e) => e.frozenWhileWatched) && effectsOf(dex, target).some((e) => e.watchesOpponent)
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

/** What modifies an SCP in battle: its ability, then its Equipment (each if it has one). */
/**
 * `user`'s chance to hit with `move` (percent), after its accuracy stage;
 * null means it can't miss (the move never misses, or its ability says so).
 */
export function moveAccuracy(dex: Dex, user: Combatant, move: MoveData): number | null {
  if (effectsOf(dex, user).some((e) => e.neverMisses)) return null
  return effectiveAccuracy(move.accuracy, user.stages.acc)
}

/** True if opponents can't usefully lower `c`'s stats (its ability blocks or reverses drops). */
export function shrugsOffStatDrops(dex: Dex, c: Combatant): boolean {
  return effectsOf(dex, c).some((e) => e.blocksOpponentStatDrops || e.reversesOpponentStatDrops)
}

function effectsOf(dex: Dex, c: Combatant): Ability[] {
  const out: Ability[] = []
  const ability = getAbility(dex, species(dex, c.speciesId).ability)
  if (ability) out.push(ability)
  const equipment = equipmentFor(dex, c.speciesId, c.equipment)
  if (equipment) out.push(equipment)
  return out
}

/** The log event for an ability or Equipment visibly triggering. */
function triggered(side: SideIndex, effect: Ability, typeName?: TypeName): BattleEvent {
  return effect.source === 'equipment'
    ? { type: 'equipment', side, equipmentId: effect.id }
    : { type: 'ability', side, abilityId: effect.id, ...(typeName ? { typeName } : {}) }
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
  const priority = (side: SideIndex): Ability | null => {
    const c = activeOf(s, side)
    const effect = effectsOf(dex, c).find((e) => e.movesFirst?.(c))
    if (!effect) return null
    const watcher = effectsOf(dex, activeOf(s, other(side))).find((e) => e.watchesOpponent)
    if (watcher) {
      events.push(triggered(other(side), watcher))
      return null
    }
    return effect
  }
  const [a, b] = sides
  const pa = priority(a)
  const pb = priority(b)
  if ((pa === null) !== (pb === null)) {
    const first = pa !== null ? a : b
    events.push(triggered(first, (pa ?? pb) as Ability))
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
    c.volatiles = freshVolatiles(c.hp)
  }
  sideState.team[teamIndex].volatiles.enteredTurn = enteredTurn
  sideState.active = teamIndex
}

function runSwitchIn(s: BattleState, dex: Dex, side: SideIndex, rng: Rng, events: BattleEvent[]) {
  for (const effect of effectsOf(dex, activeOf(s, side))) {
    effect.onSwitchIn?.(abilityContext(s, dex, side, effect, rng, events))
  }
}

/**
 * One side's action. Returns true if the move actually used was a Status move
 * (for SCP-173's Unobserved). RNG is consumed in a fixed order so lockstep
 * clients stay in sync: stun check, amnesia check(s), accuracy, rolled power
 * (Jackpot), crit, roll,
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

  const move = struggling ? STRUGGLE : combatantMove(dex, user, userSpecies.moves[moveIndex])
  const isStatusMove = move.category === 'Status'
  const targetSide = other(side)

  if (!isStatusMove && attacksBlocked(dex, user, activeOf(s, targetSide))) {
    const watcher = effectsOf(dex, activeOf(s, targetSide)).find((e) => e.watchesOpponent) as Ability
    events.push(triggered(targetSide, watcher))
    events.push({ type: 'frozen', side })
    return false
  }

  events.push({ type: 'move', side, moveId: move.id })
  if (!struggling) user.pp[moveIndex] -= 1
  if (!struggling) countCrescendo(dex, side, user, move, events)
  // Finale spends the stacks, hit or miss; its power is fixed before they reset.
  const stackPower = move.powerPerStack ? move.power + move.powerPerStack * user.volatiles.stacks : null
  if (move.powerPerStack && user.volatiles.stacks > 0) {
    user.volatiles.stacks = 0
    events.push({ type: 'stacks', side, stacks: 0 })
  }

  const accuracy = moveAccuracy(dex, user, move)
  if (accuracy !== null && rng.int(1, 100) > accuracy) {
    events.push({ type: 'miss', side })
    if (move.missRecoil) loseHp(s, dex, side, move.missRecoil, 'recoil', events)
    return isStatusMove
  }

  if (isStatusMove) {
    if (!applyEffects(s, dex, side, move, rng, events)) events.push({ type: 'noEffect', side })
    return true
  }

  if (move.delay) {
    foretell(s, dex, side, move)
    events.push({ type: 'foretold', side, phase: 'set' })
    return false
  }

  const target = activeOf(s, targetSide)

  // Rolled power (Jackpot) or stack power (Finale) replaces the listed power for this hit.
  const power = move.powerRange ? rng.int(move.powerRange[0], move.powerRange[1]) : stackPower
  const hit = power === null ? move : { ...move, power }
  const critOneIn = Math.min(...effectsOf(dex, user).map((e) => e.critOneIn ?? Infinity))
  const crit = rng.chance(critOneIn === Infinity ? CRIT_CHANCE : 1 / critOneIn)
  const { damage, effectiveness } = damageFor(dex, s.level, user, target, hit, crit, rng.int(MIN_ROLL, MAX_ROLL))

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
  if (isNeutralized(target) && knockedOut(s, dex, targetSide, events)) {
    if (move === STRUGGLE) struggleRecoil(s, dex, side, events)
    return false
  }

  for (const effect of effectsOf(dex, target)) {
    effect.afterDamagedByMove?.(abilityContext(s, dex, targetSide, effect, rng, events), move)
  }

  applyEffects(s, dex, side, move, rng, events)
  if (move === STRUGGLE) struggleRecoil(s, dex, side, events)
  return false
}

function struggleRecoil(s: BattleState, dex: Dex, side: SideIndex, events: BattleEvent[]): void {
  loseHp(s, dex, side, STRUGGLE_RECOIL, 'recoil', events)
}

/** `side`'s active loses `fraction` of its max HP (min 1). No-op if already Neutralized. */
function loseHp(
  s: BattleState,
  dex: Dex,
  side: SideIndex,
  fraction: number,
  type: 'recoil' | 'abilityDamage',
  events: BattleEvent[],
): boolean {
  const c = activeOf(s, side)
  if (isNeutralized(c)) return false // e.g. already Neutralized by the target's retaliation
  const amount = Math.min(c.hp, Math.max(1, Math.floor(c.stats.hp * fraction)))
  c.hp -= amount
  events.push({ type, side, amount, hpAfter: c.hp })
  if (isNeutralized(c)) knockedOut(s, dex, side, events)
  return true
}

/**
 * `side`'s active just hit 0 HP. Rebirth brings it back once per battle
 * (status and stat stages cleared); otherwise it's Neutralized. Returns true
 * if it stays down.
 */
function knockedOut(s: BattleState, dex: Dex, side: SideIndex, events: BattleEvent[]): boolean {
  const c = activeOf(s, side)
  const rebirth = c.reborn ? undefined : effectsOf(dex, c).find((e) => e.rebirthFraction)
  if (!rebirth) {
    events.push({ type: 'neutralized', side, teamIndex: s.sides[side].active })
    return true
  }
  events.push(triggered(side, rebirth))
  c.reborn = true
  c.hp = Math.max(1, Math.floor(c.stats.hp * (rebirth.rebirthFraction as number)))
  events.push({ type: 'revive', side, hpAfter: c.hp })
  if (c.status) {
    events.push({ type: 'statusEnded', side, status: c.status.name })
    c.status = null
  }
  for (const stat of STAGEABLE) {
    if (c.stages[stat] === 0) continue
    events.push({ type: 'stage', side, stat, delta: -c.stages[stat] })
    c.stages[stat] = 0
  }
  return false
}

/** Crescendo: a move different from the last one adds a stack; repeating one resets them. */
function countCrescendo(dex: Dex, side: SideIndex, user: Combatant, move: MoveData, events: BattleEvent[]): void {
  const crescendo = effectsOf(dex, user).find((e) => e.crescendo)?.crescendo
  if (!crescendo) return
  const v = user.volatiles
  const before = v.stacks
  if (v.lastMoveId !== null) v.stacks = v.lastMoveId === move.id ? 0 : Math.min(crescendo.maxStacks, v.stacks + 1)
  v.lastMoveId = move.id
  if (v.stacks !== before) events.push({ type: 'stacks', side, stacks: v.stacks })
}

/** Queue a Foretold Strike, fixed with the user's attacking stat as it is now. */
function foretell(s: BattleState, dex: Dex, side: SideIndex, move: MoveData): void {
  const user = activeOf(s, side)
  const stat = move.category === 'Physical' ? 'atk' : 'spa'
  const strike: DelayedStrike = {
    side,
    moveId: move.id,
    landsOnTurn: s.turn + (move.delay as number),
    power: move.power,
    type: move.type,
    category: move.category,
    attack: effectiveStat(user, stat),
    sameType: (species(dex, user.speciesId).types as readonly string[]).includes(move.type),
  }
  s.delayed = [...(s.delayed ?? []), strike]
}

/** Land every Foretold Strike due this turn, in the order they were used. */
function landStrikes(s: BattleState, dex: Dex, rng: Rng, events: BattleEvent[]): void {
  const due = (s.delayed ?? []).filter((d) => d.landsOnTurn <= s.turn)
  if (due.length === 0) return
  const rest = (s.delayed ?? []).filter((d) => d.landsOnTurn > s.turn)
  if (rest.length > 0) s.delayed = rest
  else delete s.delayed
  for (const d of due) {
    const targetSide = other(d.side)
    const target = activeOf(s, targetSide)
    if (isNeutralized(target)) {
      events.push({ type: 'foretold', side: targetSide, phase: 'fizzles' })
      continue
    }
    const move: MoveData = { ...moveData(dex, d.moveId), type: d.type, power: d.power }
    const defense = effectiveStat(target, d.category === 'Physical' ? 'def' : 'spd')
    const effectiveness = typeEffectiveness(d.type, species(dex, target.speciesId).types)
    const abilityMultiplier = effectsOf(dex, target).reduce(
      (m, e) => m * (e.incomingDamageMultiplier?.(target, move) ?? 1),
      1,
    )
    const damage = computeDamage({
      level: s.level,
      power: d.power,
      attack: d.attack,
      defense,
      sameType: d.sameType,
      effectiveness,
      abilityMultiplier,
      crit: false,
      roll: rng.int(MIN_ROLL, MAX_ROLL),
    })
    const dealt = Math.min(damage, target.hp)
    target.hp -= dealt
    events.push({ type: 'foretold', side: targetSide, phase: 'lands' })
    events.push({ type: 'damage', side: targetSide, amount: dealt, hpAfter: target.hp, effectiveness, crit: false })
    if (isNeutralized(target)) knockedOut(s, dex, targetSide, events)
  }
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
      case 'resetSelf': {
        const user = activeOf(s, side)
        if (user.status) {
          events.push({ type: 'statusEnded', side, status: user.status.name })
          user.status = null
          changed = true
        }
        for (const stat of STAGEABLE) {
          if (user.stages[stat] === 0) continue
          events.push({ type: 'stage', side, stat, delta: -user.stages[stat] })
          user.stages[stat] = 0
          changed = true
        }
        break
      }
      case 'withdraw': {
        if (withdraw(s, side, events)) changed = true
        break
      }
    }
  }
  return changed
}

/**
 * Mark `side`'s active to leave at the end of the turn. Not possible while
 * Contained (it can't switch), Neutralized, or with nobody healthy to send in.
 */
function canWithdraw(s: BattleState, side: SideIndex): boolean {
  const c = activeOf(s, side)
  return !isNeutralized(c) && c.status?.name !== 'Contained' && !c.volatiles.withdrawing && switchTargets(s, side).length > 0
}

function withdraw(s: BattleState, side: SideIndex, events: BattleEvent[]): boolean {
  if (!canWithdraw(s, side)) return false
  activeOf(s, side).volatiles.withdrawing = true
  events.push({ type: 'withdraw', side })
  return true
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
  const blocker = effectsOf(dex, c).find((e) => e.blocksOpponentStatDrops)
  const reverser = blocker ? undefined : effectsOf(dex, c).find((e) => e.reversesOpponentStatDrops)
  let changed = false
  let blocked = false
  let reversed = false
  for (const stat of STAGEABLE) {
    let requested = changes[stat]
    if (!requested) continue
    if (requested < 0 && byOpponent && blocker) {
      blocked = true
      continue
    }
    if (requested < 0 && byOpponent && reverser) {
      if (!reversed) events.push(triggered(side, reverser))
      reversed = true
      // Accuracy never rises, so a reversed accuracy drop just fails.
      if (stat === 'acc') continue
      requested = -requested
    }
    const [lo, hi] = stat === 'acc' ? [ACC_MIN_STAGE, ACC_MAX_STAGE] : [MIN_STAGE, MAX_STAGE]
    const next = Math.max(lo, Math.min(hi, c.stages[stat] + requested))
    const delta = next - c.stages[stat]
    if (delta === 0) continue
    c.stages[stat] = next
    events.push({ type: 'stage', side, stat, delta })
    changed = true
  }
  if (blocked && blocker) events.push(triggered(side, blocker))
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
  const burnMultiplier = user.status?.name === 'Burning' && move.category === 'Physical' ? BURN_PHYSICAL_MULTIPLIER : 1
  const abilityMultiplier =
    effectsOf(dex, target).reduce((m, e) => m * (e.incomingDamageMultiplier?.(target, move) ?? 1), 1) *
    effectsOf(dex, user).reduce((m, e) => m * (e.outgoingDamageMultiplier?.(user, target, move) ?? 1), 1) *
    burnMultiplier
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
  return !effectsOf(dex, c).some((e) => e.statusImmunities?.includes(status))
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
      events.push(triggered(side, ability, typeName))
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
    canWithdraw: () => canWithdraw(s, side),
    withdraw: () => withdraw(s, side, events),
    inflictStatus: (who, status) => inflictStatus(s, dex, sideOf(who), status, rng, events),
    heal: (who, fraction) => heal(s, sideOf(who), fraction, events),
    damage: (who, fraction) => loseHp(s, dex, sideOf(who), fraction, 'abilityDamage', events),
    rewindTo(hp) {
      const c = activeOf(s, side)
      c.hp = Math.min(c.stats.hp, hp)
      c.rewound = true
      events.push({ type: 'rewind', side, hpAfter: c.hp })
    },
  }
}

/**
 * End-of-turn status damage as a fraction of max HP: Bleeding 1/8, Contained
 * and Burning 1/16, Irradiated 1/16 more each tick since entering (capped);
 * 0 for statuses that deal none.
 */
function residualFraction(status: StatusName, c: Combatant): number {
  switch (status) {
    case 'Bleeding':
      return BLEED_FRACTION
    case 'Contained':
      return CONTAINED_FRACTION
    case 'Burning':
      return BURN_FRACTION
    case 'Irradiated':
      return Math.min(RAD_MAX_STEPS, c.volatiles.radTicks + 1) * RAD_FRACTION_STEP
    default:
      return 0
  }
}

/**
 * End of turn, faster active first. For each: status damage (see
 * residualFraction, min 1), then Contained counts down, then its end-of-turn
 * ability. Finally record which actives are "watched" next turn.
 */
function endOfTurn(
  s: BattleState,
  dex: Dex,
  rng: Rng,
  events: BattleEvent[],
  watchedNext: readonly [boolean, boolean],
): void {
  landStrikes(s, dex, rng, events)
  const alive = SIDES.filter((side) => !isNeutralized(activeOf(s, side)))
  for (const side of orderBySpeed(s, alive, rng)) {
    const c = activeOf(s, side)
    // An earlier side's end-of-turn ability may have Neutralized this one.
    if (isNeutralized(c)) continue
    const status = c.status
    const fraction = status ? residualFraction(status.name, c) : 0
    if (status && fraction > 0) {
      if (status.name === 'Irradiated') c.volatiles.radTicks++
      const amount = Math.min(c.hp, Math.max(1, Math.floor(c.stats.hp * fraction)))
      c.hp -= amount
      events.push({ type: 'residual', side, status: status.name, amount, hpAfter: c.hp })
      // Rebirth clears the status, so a revived SCP goes straight on to its end-of-turn ability.
      if (isNeutralized(c) && knockedOut(s, dex, side, events)) continue
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
    for (const effect of effectsOf(dex, c)) {
      effect.onEndOfTurn?.(abilityContext(s, dex, side, effect, rng, events))
    }
  }

  for (const side of SIDES) {
    const c = activeOf(s, side)
    c.volatiles.watched = watchedNext[side]
    // HP history for Rewind.
    c.volatiles.hpTwoAgo = c.volatiles.hpOneAgo
    c.volatiles.hpOneAgo = c.hp
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
  // A Neutralized active must be replaced; a withdrawing one leaves if it still can.
  const leaving = (side: SideIndex) => {
    const c = activeOf(s, side)
    return isNeutralized(c) || (c.volatiles.withdrawing && switchTargets(s, side).length > 0)
  }
  const needs: [boolean, boolean] = [leaving(0), leaving(1)]
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
  const s: BattleState = {
    ...state,
    sides: [cloneSide(state.sides[0]), cloneSide(state.sides[1])],
    needsReplacement: [...state.needsReplacement],
  }
  // Strikes are never mutated, only replaced, so a new array is enough.
  if (state.delayed) s.delayed = [...state.delayed]
  return s
}
