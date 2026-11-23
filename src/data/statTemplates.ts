import type { ObjectClass, Stats, StatName } from '../engine'

/** Base stat total for each object class. */
export const CLASS_STAT_TOTAL: Readonly<Record<ObjectClass, number>> = {
  Safe: 450,
  Euclid: 475,
  Keter: 600,
}

/**
 * Stat Templates (see GLOSSARY.md): starting spreads, written at a 600 total
 * and scaled to the SCP's class total. Order: HP, Atk, Def, SpA, SpD, Spe.
 */
export const STAT_TEMPLATES = {
  /** Hits hard and fast, physically; fragile. */
  fastPhysical: { hp: 85, atk: 135, def: 80, spa: 55, spd: 80, spe: 165 },
  /** Hits hard and fast, specially; fragile. */
  fastSpecial: { hp: 85, atk: 55, def: 80, spa: 135, spd: 80, spe: 165 },
  /** Slow, sturdy physical hitter. */
  physicalBruiser: { hp: 110, atk: 140, def: 110, spa: 50, spd: 90, spe: 100 },
  /** Slow, sturdy special hitter. */
  specialBruiser: { hp: 110, atk: 50, def: 90, spa: 140, spd: 110, spe: 100 },
  /** Takes hits; deals little. */
  wall: { hp: 130, atk: 70, def: 150, spa: 60, spd: 140, spe: 50 },
  /** Bulky with middling offence, for status and healing. */
  support: { hp: 140, atk: 70, def: 110, spa: 80, spd: 130, spe: 70 },
  /** Even across the board. */
  balanced: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
} as const satisfies Record<string, Stats>

export type StatTemplateId = keyof typeof STAT_TEMPLATES

/** At most this many points may be moved between stats away from the template. */
export const MAX_STAT_TWEAK = 20

const STAT_ORDER: readonly StatName[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']

/**
 * Scale a template to `total`, keeping the exact total: each stat is rounded
 * down, then the leftover points go to the stats with the largest remainders
 * (ties in HP-to-Speed order).
 */
export function scaleTemplate(template: StatTemplateId, total: number): Stats {
  const spread = STAT_TEMPLATES[template]
  const sum = STAT_ORDER.reduce((s, k) => s + spread[k], 0)
  const exact = STAT_ORDER.map((k) => (spread[k] * total) / sum)
  const stats = exact.map(Math.floor)
  const leftover = total - stats.reduce((a, b) => a + b, 0)
  const byRemainder = STAT_ORDER.map((_, i) => i).sort((a, b) => exact[b] - stats[b] - (exact[a] - stats[a]) || a - b)
  for (let i = 0; i < leftover; i++) stats[byRemainder[i]]++
  return Object.fromEntries(STAT_ORDER.map((k, i) => [k, stats[i]])) as Stats
}

/** A template's scaled stats plus tweaks (which must net to 0). */
export function templateStats(template: StatTemplateId, total: number, tweaks: Partial<Stats> = {}): Stats {
  const base = scaleTemplate(template, total)
  return Object.fromEntries(STAT_ORDER.map((k) => [k, base[k] + (tweaks[k] ?? 0)])) as Stats
}
