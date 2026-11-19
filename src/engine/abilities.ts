import type { Combatant } from './model'
import type { TypeName } from './typeChart'

/**
 * An ability is a small bundle of hooks the engine calls at fixed points.
 * Hooks receive the (already cloned) working Combatant and may update its
 * volatiles. New hook points are added only when an ability needs one.
 */
export interface Ability {
  id: string
  name: string
  description: string
  /** Turn order: return true to move before a non-prioritized opponent. */
  movesFirst?(self: Combatant): boolean
  /** Extra multiplier on damage this SCP takes from a move of `moveType`. */
  incomingDamageMultiplier?(self: Combatant, moveType: TypeName): number
  /** After taking move damage. Return true if the ability visibly triggered. */
  afterDamagedByMove?(self: Combatant, moveType: TypeName): boolean
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
    incomingDamageMultiplier: (self, moveType) =>
      self.volatiles.adaptedType === moveType ? 0.5 : 1,
    afterDamagedByMove(self, moveType) {
      if (self.volatiles.adaptedType === moveType) return false
      self.volatiles.adaptedType = moveType
      return true
    },
  },
}

export function getAbility(id: string | undefined): Ability | null {
  if (id === undefined) return null
  const ability = ABILITIES[id]
  if (!ability) throw new Error(`unknown ability '${id}'`)
  return ability
}
