import type { Combatant, StageableStat, StatName } from './model'

/** Every SCP battles at this level (no EVs, IVs, or natures). */
export const LEVEL = 50

export const MIN_STAGE = -6
export const MAX_STAGE = 6

/** Level-applied stat from a base stat (Pokémon formula with 0 IV / 0 EV / neutral nature). */
export function calcStat(stat: StatName, base: number, level: number = LEVEL): number {
  const core = Math.floor((2 * base * level) / 100)
  return stat === 'hp' ? core + level + 10 : core + 5
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
