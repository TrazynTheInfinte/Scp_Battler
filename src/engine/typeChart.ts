/**
 * The Type Ring (see GLOSSARY.md): each type is super effective (x2) against
 * the next two types around the ring and resisted (x0.5) by them in return.
 * Every other matchup is neutral. There are no immunities. Mundane sits
 * outside the ring and is always neutral.
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

/** The eight types in the Type Ring. */
export type RingType = (typeof TYPE_RING)[number]

/** Mundane (see GLOSSARY.md): outside the ring; x1 against everything, and takes x1 from everything. */
export const MUNDANE = 'Mundane'

export type TypeName = RingType | typeof MUNDANE

/** Every type: the ring in order, then Mundane. */
export const ALL_TYPES: readonly TypeName[] = [...TYPE_RING, MUNDANE]

export type Effectiveness = 0.5 | 1 | 2

const RING_SIZE = TYPE_RING.length

/** Multiplier for a move of `attack` type hitting a single `defend` type. */
export function matchup(attack: TypeName, defend: TypeName): Effectiveness {
  if (attack === MUNDANE || defend === MUNDANE) return 1
  const a = TYPE_RING.indexOf(attack)
  const d = TYPE_RING.indexOf(defend)
  const forward = (d - a + RING_SIZE) % RING_SIZE
  if (forward === 1 || forward === 2) return 2
  const backward = (a - d + RING_SIZE) % RING_SIZE
  if (backward === 1 || backward === 2) return 0.5
  return 1
}

/**
 * The type that counters `t`: the one just before it on the ring, which hits
 * `t` super effectively. Mundane has no counter and stays Mundane.
 */
export function counterType(t: TypeName): TypeName {
  if (t === MUNDANE) return t
  return TYPE_RING[(TYPE_RING.indexOf(t) - 1 + RING_SIZE) % RING_SIZE]
}

/** Combined multiplier against a one- or two-type defender (stacks: x4 .. x0.25). */
export function typeEffectiveness(attack: TypeName, defenders: readonly TypeName[]): number {
  return defenders.reduce((mult, t) => mult * matchup(attack, t), 1)
}
