import type { AbilityData, AbilityRule, Combatant, Dex, MoveData, StatStages, StatusName } from './model'
import type { Rng } from './rng'
import { MAX_STAGE } from './stats'
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
}

/** The hooks and flags the engine checks at fixed points. Rules fill these in. */
interface AbilityHooks {
  // --- Flags ---
  /** Opponents' moves and abilities can't lower this SCP's stat stages. */
  blocksOpponentStatDrops?: boolean
  /** Statuses this SCP can never receive (on top of type immunities). */
  statusImmunities?: readonly StatusName[]
  /**
   * A watcher: the opposing active's priority abilities (e.g. Unobserved)
   * don't work, and an opponent with `frozenWhileWatched` can't attack.
   */
  watchesOpponent?: boolean
  /** Its attacking moves fail while the opposing active is a watcher. */
  frozenWhileWatched?: boolean

  // --- Hooks ---
  /** Turn order: return true to move before a non-prioritized opponent. */
  movesFirst?(self: Combatant): boolean
  /** Extra multiplier on damage this SCP takes from `move`. */
  incomingDamageMultiplier?(self: Combatant, move: MoveData): number
  /** Extra multiplier on damage this SCP deals with `move` to `target`. */
  outgoingDamageMultiplier?(self: Combatant, target: Combatant, move: MoveData): number
  /** After this SCP takes move damage and survives. `opponent` is the attacker. */
  afterDamagedByMove?(ctx: AbilityContext, move: MoveData): void
  /** When this SCP enters the field (battle start, switch, or replacement). */
  onSwitchIn?(ctx: AbilityContext): void
  /** At end of turn, after this SCP's status damage. */
  onEndOfTurn?(ctx: AbilityContext): void
}

/** An ability ready for the engine: its data plus the hooks its rules add up to. */
export interface Ability extends AbilityHooks {
  id: string
  name: string
  description: string
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
        onEndOfTurn(ctx) {
          if (ctx.self.hp >= ctx.self.stats.hp) return
          ctx.announce()
          ctx.heal('self', rule.fraction)
        },
      }
    case 'blockStatDrops':
      return { blocksOpponentStatDrops: true }
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

/** Combine an ability's rules: flags OR together, multipliers multiply, event hooks run in rule order. */
export function compileAbility(data: AbilityData): Ability {
  const parts = data.rules.map(hooksFor)
  const fns = <K extends keyof AbilityHooks>(key: K) =>
    parts.flatMap((p) => (p[key] ? [p[key] as NonNullable<AbilityHooks[K]>] : []))

  const ability: Ability = { id: data.id, name: data.name, description: data.description }
  if (parts.some((p) => p.blocksOpponentStatDrops)) ability.blocksOpponentStatDrops = true
  if (parts.some((p) => p.watchesOpponent)) ability.watchesOpponent = true
  if (parts.some((p) => p.frozenWhileWatched)) ability.frozenWhileWatched = true
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
  const entry = fns('onSwitchIn')
  if (entry.length > 0) ability.onSwitchIn = (ctx) => entry.forEach((f) => f(ctx))
  const endTurn = fns('onEndOfTurn')
  if (endTurn.length > 0) ability.onEndOfTurn = (ctx) => endTurn.forEach((f) => f(ctx))
  return ability
}

const compiled = new WeakMap<AbilityData, Ability>()

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
