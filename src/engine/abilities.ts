import type { Combatant, MoveData, StatStages, StatusName } from './model'
import type { Rng } from './rng'
import type { TypeName } from './typeChart'

/** Enraged stops raising Attack after this many boosts, until the SCP leaves the field. */
export const ENRAGED_MAX_BOOSTS = 2

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
}

/**
 * An ability is a bundle of optional hooks and flags the engine checks at
 * fixed points. Add a new hook point only when an ability needs one.
 */
export interface Ability {
  id: string
  name: string
  description: string

  // --- Flags ---
  /** Opponents' moves and abilities can't lower this SCP's stat stages. */
  blocksOpponentStatDrops?: boolean
  /** Statuses this SCP can never receive (on top of type immunities). */
  statusImmunities?: readonly StatusName[]
  /** The opposing active's priority abilities (e.g. Unobserved) don't work. */
  suppressesOpponentPriority?: boolean

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

export const ABILITIES: Readonly<Record<string, Ability>> = {
  unobserved: {
    id: 'unobserved',
    name: 'Unobserved',
    description:
      'Always moves first, unless the opponent used a Status move last turn and is watching it.',
    movesFirst: (self) => !self.volatiles.watched,
  },

  adaptive: {
    id: 'adaptive',
    name: 'Adaptive',
    description:
      'After taking damage from a move, takes half damage from that type until it switches out. Remembers only the latest type.',
    incomingDamageMultiplier: (self, move) => (self.volatiles.adaptedType === move.type ? 0.5 : 1),
    afterDamagedByMove(ctx, move) {
      if (ctx.self.volatiles.adaptedType === move.type) return
      ctx.self.volatiles.adaptedType = move.type
      ctx.announce(move.type)
    },
  },

  jovial: {
    id: 'jovial',
    name: 'Jovial',
    description: 'Heals 1/16 of its max HP at the end of each turn.',
    onEndOfTurn(ctx) {
      if (ctx.self.hp >= ctx.self.stats.hp) return
      ctx.announce()
      ctx.heal('self', 1 / 16)
    },
  },

  precisionEngineering: {
    id: 'precisionEngineering',
    name: 'Precision Engineering',
    description: "Opponents can't lower its stats.",
    blocksOpponentStatDrops: true,
  },

  willingDetainee: {
    id: 'willingDetainee',
    name: 'Willing Detainee',
    description: "Can't be Contained.",
    statusImmunities: ['Contained'],
  },

  everWatchful: {
    id: 'everWatchful',
    name: 'Ever Watchful',
    description: "The opponent's Unobserved never triggers.",
    suppressesOpponentPriority: true,
  },

  enraged: {
    id: 'enraged',
    name: 'Enraged',
    description:
      'Raises its Attack by 1 when it takes damage from a move, up to twice each time it enters the field.',
    afterDamagedByMove(ctx) {
      if (ctx.self.stages.atk >= 6 || ctx.self.volatiles.enragedBoosts >= ENRAGED_MAX_BOOSTS) return
      ctx.self.volatiles.enragedBoosts++
      ctx.announce()
      ctx.changeStages('self', { atk: 1 })
    },
  },

  theCure: {
    id: 'theCure',
    name: 'The Cure',
    description: 'Deals 1.5x damage to targets that have a status condition.',
    outgoingDamageMultiplier: (_self, target) => (target.status ? 1.5 : 1),
  },

  bootSequence: {
    id: 'bootSequence',
    name: 'Boot Sequence',
    description: 'Raises its Sp. Attack by 1 when it enters the field.',
    onSwitchIn(ctx) {
      if (ctx.self.stages.spa >= 6) return
      ctx.announce()
      ctx.changeStages('self', { spa: 1 })
    },
  },

  morbidAllure: {
    id: 'morbidAllure',
    name: 'Morbid Allure',
    description: 'An SCP that hits it with a Physical move has a 30% chance to start Bleeding.',
    afterDamagedByMove(ctx, move) {
      if (move.category !== 'Physical') return
      if (!ctx.rng.chance(0.3)) return
      if (!ctx.canInflict('opponent', 'Bleeding')) return
      ctx.announce()
      ctx.inflictStatus('opponent', 'Bleeding')
    },
  },

  phasing: {
    id: 'phasing',
    name: 'Phasing',
    description: 'Takes half damage from Physical moves.',
    incomingDamageMultiplier: (_self, move) => (move.category === 'Physical' ? 0.5 : 1),
  },

  selfKeepingSecret: {
    id: 'selfKeepingSecret',
    name: 'Self-Keeping Secret',
    description: "When it enters the field, the opponent forgets its stat boosts.",
    onSwitchIn(ctx) {
      const opp = ctx.opponent
      if (opp.hp <= 0) return
      if (!Object.values(opp.stages).some((v) => v > 0)) return
      ctx.announce()
      ctx.clearBoosts('opponent')
    },
  },
}

export function getAbility(id: string | undefined): Ability | null {
  if (id === undefined) return null
  const ability = ABILITIES[id]
  if (!ability) throw new Error(`unknown ability '${id}'`)
  return ability
}
