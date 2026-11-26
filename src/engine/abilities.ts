import type { AbilityData, AbilityRule, Combatant, Dex, EquipmentData, MoveData, StatStages, StatusName } from './model'
import type { Rng } from './rng'
import { ACC_MIN_STAGE, MAX_STAGE, MIN_STAGE } from './stats'
import type { TypeName } from './typeChart'

/**
 * What an ability hook may do. The engine builds one bound to the ability
 * owner's side; "self" is the owner's active SCP and "opponent" is the other
 * side's active SCP. Every helper is a no-op on a Neutralized SCP and emits
 * the matching battle events itself.
 */
export interface AbilityContext {
  self: Combatant
  opponent: Combatant
  rng: Rng
  /** Log that this ability triggered (call before its visible effects). */
  announce(typeName?: TypeName): void
  /** Apply stage changes; returns true if any stage moved. */
  changeStages(who: 'self' | 'opponent', changes: Partial<StatStages>): boolean
  /** Reset every positive stat stage to 0; returns true if any were reset. */
  clearBoosts(who: 'self' | 'opponent'): boolean
  /** True if `inflictStatus` would succeed right now. */
  canInflict(who: 'self' | 'opponent', status: StatusName): boolean
  inflictStatus(who: 'self' | 'opponent', status: StatusName): boolean
  /** Heal a fraction of max HP (min 1); returns true if any HP was restored. */
  heal(who: 'self' | 'opponent', fraction: number): boolean
  /** Deal a fraction of max HP as damage (min 1); returns true if any was dealt. */
  damage(who: 'self' | 'opponent', fraction: number): boolean
  /** True if `withdraw` would succeed right now. */
  canWithdraw(): boolean
  /** The owner leaves the field at the end of this turn; its side picks who comes in. */
  withdraw(): boolean
  /** Rewind: set the owner's HP back to `hp` (once per battle; marks it used). */
  rewindTo(hp: number): void
}

/** The hooks and flags the engine checks at fixed points. Rules fill these in. */
interface AbilityHooks {
  // --- Flags ---
  /** Opponents' moves and abilities can't lower this SCP's stat stages. */
  blocksOpponentStatDrops?: boolean
  /** Opponents' stat drops on this SCP become boosts instead (accuracy drops fail). */
  reversesOpponentStatDrops?: boolean
  /** This SCP's moves never miss. */
  neverMisses?: boolean
  /** Statuses this SCP can never receive (on top of type immunities). */
  statusImmunities?: readonly StatusName[]
  /**
   * A watcher: the opposing active's priority abilities (e.g. Unobserved)
   * don't work, and an opponent with `frozenWhileWatched` can't attack.
   */
  watchesOpponent?: boolean
  /** Its attacking moves fail while the opposing active is a watcher. */
  frozenWhileWatched?: boolean
  /** Multiplier on each move's PP at the start of battle. */
  ppMultiplier?: number
  /** Heals at the end of every turn. Equipment healing doesn't stack with an ability's (see equipmentFor). */
  healsEachTurn?: boolean
  /** Its damaging hits are critical one time in this many (the best of several wins). */
  critOneIn?: number
  /** Rebirth: comes back once per battle at this fraction of max HP instead of being Neutralized. */
  rebirthFraction?: number
  /** Crescendo: stacks built by varying its moves. */
  crescendo?: { perStack: number; maxStacks: number }
  /** Takes no damage from Traps when it switches in. */
  ignoresTraps?: boolean

  // --- Hooks ---
  /** Turn order: return true to move before a non-prioritized opponent. */
  movesFirst?(self: Combatant): boolean
  /** Extra multiplier on damage this SCP takes from `move`. */
  incomingDamageMultiplier?(self: Combatant, move: MoveData): number
  /** Extra multiplier on damage this SCP deals with `move` to `target`. */
  outgoingDamageMultiplier?(self: Combatant, target: Combatant, move: MoveData): number
  /** After this SCP takes move damage and survives. `opponent` is the attacker. */
  afterDamagedByMove?(ctx: AbilityContext, move: MoveData): void
  /** After this SCP lands a damaging hit on a target that survives (once per hit). `opponent` is the target. */
  afterHitting?(ctx: AbilityContext, move: MoveData): void
  /** When this SCP enters the field (battle start, switch, or replacement). */
  onSwitchIn?(ctx: AbilityContext): void
  /** At end of turn, after this SCP's status damage. */
  onEndOfTurn?(ctx: AbilityContext): void
}

/**
 * An ability or a piece of Equipment, ready for the engine: its data plus the
 * hooks its rules add up to. `source` says which, for the battle log.
 */
export interface Ability extends AbilityHooks {
  id: string
  name: string
  description: string
  source: 'ability' | 'equipment'
}

/** True if every stat in `changes` that would rise is already at +6. */
const allMaxed = (stages: StatStages, changes: Partial<StatStages>) =>
  (Object.entries(changes) as [keyof StatStages, number][]).every(
    ([stat, n]) => n <= 0 || stages[stat] >= MAX_STAGE,
  )

/**
 * The engine's implementation of each rule kind. Adding a new kind here is
 * the only code a new ability ever needs; everything else is data.
 */
function hooksFor(rule: AbilityRule): AbilityHooks {
  switch (rule.kind) {
    case 'healEachTurn':
      return {
        healsEachTurn: true,
        onEndOfTurn(ctx) {
          if (ctx.self.hp >= ctx.self.stats.hp) return
          ctx.announce()
          ctx.heal('self', rule.fraction)
        },
      }
    case 'randomWithdraw':
      return {
        onEndOfTurn(ctx) {
          // Roll only when it could happen, so the RNG stream doesn't depend on a failed attempt.
          if (!ctx.canWithdraw() || !ctx.rng.chance(rule.chance / 100)) return
          ctx.announce()
          ctx.withdraw()
        },
      }
    case 'blockStatDrops':
      return { blocksOpponentStatDrops: true }
    case 'reverseStatDrops':
      return { reversesOpponentStatDrops: true }
    case 'neverMisses':
      return { neverMisses: true }
    case 'opponentStagesOnEntry':
      return {
        onSwitchIn(ctx) {
          const opp = ctx.opponent
          if (opp.hp <= 0) return
          const floor = (stat: keyof StatStages) => (stat === 'acc' ? ACC_MIN_STAGE : MIN_STAGE)
          const room = (Object.entries(rule.changes) as [keyof StatStages, number][]).some(
            ([stat, n]) => n < 0 && opp.stages[stat] > floor(stat),
          )
          if (!room) return
          ctx.announce()
          ctx.changeStages('opponent', rule.changes)
        },
      }
    case 'statusImmunity':
      return { statusImmunities: rule.statuses }
    case 'watcher':
      return { watchesOpponent: true }
    case 'unobserved':
      return {
        movesFirst: (self) => !self.volatiles.watched && !self.status,
        frozenWhileWatched: true,
      }
    case 'adaptive':
      return {
        incomingDamageMultiplier: (self, move) =>
          !move.typeless && self.volatiles.adaptedType === move.type ? rule.multiplier : 1,
        afterDamagedByMove(ctx, move) {
          if (move.typeless || ctx.self.volatiles.adaptedType === move.type) return
          ctx.self.volatiles.adaptedType = move.type
          ctx.announce(move.type)
        },
      }
    case 'boostWhenHit':
      return {
        afterDamagedByMove(ctx) {
          if (allMaxed(ctx.self.stages, rule.changes) || ctx.self.volatiles.hitBoosts >= rule.maxPerEntry) return
          ctx.self.volatiles.hitBoosts++
          ctx.announce()
          ctx.changeStages('self', rule.changes)
        },
      }
    case 'boostOnEntry':
      return {
        onSwitchIn(ctx) {
          if (allMaxed(ctx.self.stages, rule.changes)) return
          ctx.announce()
          ctx.changeStages('self', rule.changes)
        },
      }
    case 'damageDealtVsStatused':
      return { outgoingDamageMultiplier: (_self, target) => (target.status ? rule.multiplier : 1) }
    case 'damageTaken':
      return {
        incomingDamageMultiplier: (_self, move) => (move.category === rule.category ? rule.multiplier : 1),
      }
    case 'afflictAttacker':
      return {
        afterDamagedByMove(ctx, move) {
          if (move.category !== rule.category) return
          if (!ctx.rng.chance(rule.chance / 100)) return
          if (!ctx.canInflict('opponent', rule.status)) return
          ctx.announce()
          ctx.inflictStatus('opponent', rule.status)
        },
      }
    case 'retaliate':
      return {
        afterDamagedByMove(ctx) {
          if (ctx.opponent.hp <= 0) return
          ctx.announce()
          ctx.damage('opponent', rule.fraction)
        },
      }
    case 'drainOpponentEachTurn':
      return {
        onEndOfTurn(ctx) {
          if (ctx.opponent.hp <= 0) return
          ctx.announce()
          ctx.damage('opponent', rule.fraction)
        },
      }
    case 'critChance':
      return { critOneIn: rule.oneIn }
    case 'rebirth':
      return { rebirthFraction: rule.fraction }
    case 'crescendo':
      return {
        crescendo: { perStack: rule.perStack, maxStacks: rule.maxStacks },
        // Moves that spend the stacks (Finale) get them as power instead.
        outgoingDamageMultiplier: (self, _target, move) =>
          move.powerPerStack ? 1 : 1 + rule.perStack * self.volatiles.stacks,
      }
    case 'rewind':
      return {
        onEndOfTurn(ctx) {
          const c = ctx.self
          if (c.rewound || c.hp <= 0 || c.hp >= c.stats.hp * rule.below) return
          const back = c.volatiles.hpTwoAgo
          if (back <= c.hp) return
          ctx.announce()
          ctx.rewindTo(back)
        },
      }
    case 'extraPp':
      return { ppMultiplier: 1 + rule.fraction }
    case 'ignoresTraps':
      return { ignoresTraps: true }
    case 'afflictOnHit':
      return {
        afterHitting(ctx) {
          if (!ctx.rng.chance(rule.chance / 100)) return
          if (!ctx.canInflict('opponent', rule.status)) return
          ctx.announce()
          ctx.inflictStatus('opponent', rule.status)
        },
      }
    case 'clearOpponentBoostsOnEntry':
      return {
        onSwitchIn(ctx) {
          const opp = ctx.opponent
          if (opp.hp <= 0) return
          if (!Object.values(opp.stages).some((v) => v > 0)) return
          ctx.announce()
          ctx.clearBoosts('opponent')
        },
      }
  }
}

/** Combine an ability's (or Equipment's) rules: flags OR together, multipliers multiply, event hooks run in rule order. */
export function compileAbility(data: AbilityData, source: Ability['source'] = 'ability'): Ability {
  const parts = data.rules.map(hooksFor)
  const fns = <K extends keyof AbilityHooks>(key: K) =>
    parts.flatMap((p) => (p[key] ? [p[key] as NonNullable<AbilityHooks[K]>] : []))

  const ability: Ability = { id: data.id, name: data.name, description: data.description, source }
  if (parts.some((p) => p.blocksOpponentStatDrops)) ability.blocksOpponentStatDrops = true
  if (parts.some((p) => p.reversesOpponentStatDrops)) ability.reversesOpponentStatDrops = true
  if (parts.some((p) => p.neverMisses)) ability.neverMisses = true
  if (parts.some((p) => p.watchesOpponent)) ability.watchesOpponent = true
  if (parts.some((p) => p.frozenWhileWatched)) ability.frozenWhileWatched = true
  if (parts.some((p) => p.healsEachTurn)) ability.healsEachTurn = true
  if (parts.some((p) => p.ignoresTraps)) ability.ignoresTraps = true
  const crits = parts.flatMap((p) => (p.critOneIn ? [p.critOneIn] : []))
  if (crits.length > 0) ability.critOneIn = Math.min(...crits)
  const rebirth = parts.find((p) => p.rebirthFraction)
  if (rebirth) ability.rebirthFraction = rebirth.rebirthFraction
  const crescendo = parts.find((p) => p.crescendo)
  if (crescendo) ability.crescendo = crescendo.crescendo
  const pp = parts.reduce((m, p) => m * (p.ppMultiplier ?? 1), 1)
  if (pp !== 1) ability.ppMultiplier = pp
  const immunities = parts.flatMap((p) => p.statusImmunities ?? [])
  if (immunities.length > 0) ability.statusImmunities = immunities

  const first = fns('movesFirst')
  if (first.length > 0) ability.movesFirst = (self) => first.some((f) => f(self))
  const incoming = fns('incomingDamageMultiplier')
  if (incoming.length > 0) ability.incomingDamageMultiplier = (self, move) => incoming.reduce((m, f) => m * f(self, move), 1)
  const outgoing = fns('outgoingDamageMultiplier')
  if (outgoing.length > 0) {
    ability.outgoingDamageMultiplier = (self, target, move) => outgoing.reduce((m, f) => m * f(self, target, move), 1)
  }
  const afterHit = fns('afterDamagedByMove')
  if (afterHit.length > 0) ability.afterDamagedByMove = (ctx, move) => afterHit.forEach((f) => f(ctx, move))
  const hitting = fns('afterHitting')
  if (hitting.length > 0) ability.afterHitting = (ctx, move) => hitting.forEach((f) => f(ctx, move))
  const entry = fns('onSwitchIn')
  if (entry.length > 0) ability.onSwitchIn = (ctx) => entry.forEach((f) => f(ctx))
  const endTurn = fns('onEndOfTurn')
  if (endTurn.length > 0) ability.onEndOfTurn = (ctx) => endTurn.forEach((f) => f(ctx))
  return ability
}

const compiled = new WeakMap<AbilityData | EquipmentData, Ability>()

/** The Dex's ability `id`, ready for the engine (built once, then cached). */
export function getAbility(dex: Dex, id: string | undefined): Ability | null {
  if (id === undefined) return null
  const data = dex.abilities[id]
  if (!data) throw new Error(`unknown ability '${id}'`)
  let ability = compiled.get(data)
  if (!ability) {
    ability = compileAbility(data)
    compiled.set(data, ability)
  }
  return ability
}

const withoutHealing = new WeakMap<EquipmentData, Ability>()

/**
 * Equipment as it works on an SCP of `speciesId`. Healing doesn't stack: if
 * the SCP's ability already heals every turn, the piece's own every-turn
 * healing is dropped (its other rules still apply). Stops e.g. a Medkit
 * doubling a healer's regeneration into a stall nobody can break.
 */
export function equipmentFor(dex: Dex, speciesId: string, id: string | null | undefined): Ability | null {
  const equipment = getEquipment(dex, id)
  if (!equipment?.healsEachTurn || !getAbility(dex, dex.species[speciesId]?.ability)?.healsEachTurn) return equipment
  const data = dex.equipment[id as string]
  let reduced = withoutHealing.get(data)
  if (!reduced) {
    reduced = compileAbility({ ...data, rules: data.rules.filter((r) => r.kind !== 'healEachTurn') }, 'equipment')
    withoutHealing.set(data, reduced)
  }
  return reduced
}

/** False if Equipment `id` would do nothing at all on an SCP of `speciesId` (e.g. a Medkit on a healer). */
export function equipmentHasEffect(dex: Dex, speciesId: string, id: string): boolean {
  const data = dex.equipment[id]
  return !data.rules.every((r) => r.kind === 'healEachTurn') || equipmentFor(dex, speciesId, id) === getEquipment(dex, id)
}

/** The Dex's Equipment `id`, compiled like an ability (built once, then cached). */
export function getEquipment(dex: Dex, id: string | null | undefined): Ability | null {
  if (id === null || id === undefined) return null
  const data = dex.equipment[id]
  if (!data) throw new Error(`unknown equipment '${id}'`)
  let equipment = compiled.get(data)
  if (!equipment) {
    equipment = compileAbility(data, 'equipment')
    compiled.set(data, equipment)
  }
  return equipment
}
