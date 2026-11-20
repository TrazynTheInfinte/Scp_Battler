import type { Combatant, StageableStat, StatName } from './model'

/** Every SCP battles at this level (no EVs, IVs, or natures). */
export const LEVEL = 50

export const MIN_STAGE = -6
export const MAX_STAGE = 6

/**
 * Max HP is scaled up from the Pokémon formula so most hits take 3+ to knock
 * out, leaving room for healing and status moves to be worth a turn.
 */
export const HP_MULTIPLIER = 1.5

/** Level-applied stat from a base stat (Pokémon formula with 0 IV / 0 EV / neutral nature; HP x HP_MULTIPLIER). */
export function calcStat(stat: StatName, base: number, level: number = LEVEL): number {
  const core = Math.floor((2 * base * level) / 100)
  return stat === 'hp' ? Math.floor((core + level + 10) * HP_MULTIPLIER) : core + 5
}

/** +n => (2+n)/2, -n => 2/(2+n). Clamped to [-6, +6]. */
export function stageMultiplier(stage: number): number {
  const s = Math.max(MIN_STAGE, Math.min(MAX_STAGE, stage))
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s)
}

/** A stat with a given stage applied (defaults to the combatant's own stage). */
export function effectiveStat(
  c: Combatant,
  stat: StageableStat,
  stage: number = c.stages[stat],
): number {
  return Math.floor(c.stats[stat] * stageMultiplier(stage))
}
