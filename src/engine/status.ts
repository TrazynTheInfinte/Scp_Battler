import type { StatusName } from './model'
import type { TypeName } from './typeChart'

/** Bleeding: end-of-turn damage as a fraction of max HP. */
export const BLEED_FRACTION = 1 / 8
/** Contained: end-of-turn damage as a fraction of max HP. */
export const CONTAINED_FRACTION = 1 / 16
/** Contained lasts this many end-of-turn ticks, then wears off. */
export const CONTAINED_TURNS = 4
/** Stunned: Speed multiplier and chance to lose the turn. */
export const STUN_SPEED_MULTIPLIER = 0.5
export const STUN_SKIP_CHANCE = 0.25
/** Amnesiac: rolled duration (in attempts to act) and random-move chance. */
export const AMNESIAC_MIN_TURNS = 2
export const AMNESIAC_MAX_TURNS = 4
export const AMNESIA_RANDOM_MOVE_CHANCE = 1 / 3

/** Types that can never receive a given status. */
export const STATUS_IMMUNITIES: Readonly<Partial<Record<TypeName, StatusName>>> = {
  Mechanical: 'Bleeding',
  Antimemetic: 'Amnesiac',
}

export function isImmuneToStatus(types: readonly TypeName[], status: StatusName): boolean {
  return types.some((t) => STATUS_IMMUNITIES[t] === status)
}
