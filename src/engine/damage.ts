/** Chance for any damaging hit to be a critical hit. */
export const CRIT_CHANCE = 1 / 24
export const CRIT_MULTIPLIER = 1.5
export const SAME_TYPE_BONUS = 1.5
export const MIN_ROLL = 85
export const MAX_ROLL = 100

export interface DamageInput {
  level: number
  power: number
  /** Attacker's effective Attack or Sp. Attack. */
  attack: number
  /** Defender's effective Defense or Sp. Defense. */
  defense: number
  sameType: boolean
  /** Combined type multiplier (0.25 .. 4). */
  effectiveness: number
  crit: boolean
  /** Random roll, an integer in [85, 100]. */
  roll: number
  /** Product of any ability multipliers (default 1). */
  abilityMultiplier?: number
}

/**
 * Standard Pokémon damage formula:
 *   base = floor(floor(floor(2L/5 + 2) * Power * A / D) / 50) + 2
 * then x1.5 same-type bonus, x type, x ability, x1.5 crit, x roll/100, floored.
 * A hit that lands always deals at least 1.
 */
export function computeDamage(i: DamageInput): number {
  const levelFactor = Math.floor((2 * i.level) / 5 + 2)
  const base = Math.floor(Math.floor((levelFactor * i.power * i.attack) / i.defense) / 50) + 2
  let dmg = base
  if (i.sameType) dmg *= SAME_TYPE_BONUS
  dmg *= i.effectiveness
  dmg *= i.abilityMultiplier ?? 1
  if (i.crit) dmg *= CRIT_MULTIPLIER
  dmg = (dmg * i.roll) / 100
  return Math.max(1, Math.floor(dmg))
}
