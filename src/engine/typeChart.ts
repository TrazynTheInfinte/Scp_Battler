/**
 * The Type Ring (see GLOSSARY.md): each type is super effective (x2) against
 * the next two types around the ring and resisted (x0.5) by them in return.
 * Every other matchup is neutral. There are no immunities.
 */
export const TYPE_RING = [
  'Mechanical',
  'Antimemetic',
  'Memetic',
  'Biological',
  'Reality',
  'Thaumic',
  'Temporal',
  'Kinetic',
] as const

export type TypeName = (typeof TYPE_RING)[number]

export type Effectiveness = 0.5 | 1 | 2

const RING_SIZE = TYPE_RING.length

/** Multiplier for a move of `attack` type hitting a single `defend` type. */
export function matchup(attack: TypeName, defend: TypeName): Effectiveness {
  const a = TYPE_RING.indexOf(attack)
  const d = TYPE_RING.indexOf(defend)
  const forward = (d - a + RING_SIZE) % RING_SIZE
  if (forward === 1 || forward === 2) return 2
  const backward = (a - d + RING_SIZE) % RING_SIZE
  if (backward === 1 || backward === 2) return 0.5
  return 1
}

/** Combined multiplier against a one- or two-type defender (stacks: x4 .. x0.25). */
export function typeEffectiveness(attack: TypeName, defenders: readonly TypeName[]): number {
  return defenders.reduce((mult, t) => mult * matchup(attack, t), 1)
}
