/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * The engine never calls Math.random(): every random roll goes through an Rng
 * so a battle is fully reproducible from its seed (see docs/adr/0001 and 0002 —
 * online lockstep requires both clients to roll identically).
 *
 * The state is a plain number so it can live inside serializable battle state.
 */
export interface Rng {
  /** Current internal state; persist this to resume the sequence later. */
  readonly state: number
  /** Float in [0, 1). */
  next(): number
  /** Integer in [min, max] (inclusive). */
  int(min: number, max: number): number
  /** True with probability `p` (0..1). */
  chance(p: number): boolean
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    get state() {
      return state
    },
    next,
    int(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
        throw new RangeError(`invalid int range [${min}, ${max}]`)
      }
      return min + Math.floor(next() * (max - min + 1))
    },
    chance(p) {
      return next() < p
    },
  }
}
