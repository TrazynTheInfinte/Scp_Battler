import { MUNDANE, TEAM_BUDGET, TYPE_RING, type Dex, type RingType } from '../engine'
import type { BalanceResult } from './simulate'

/**
 * The balance limits (docs/adr/0003). A wave can't ship while any is broken;
 * the fix is a roster or rules change, not loosening these.
 */
/** Battles each focused SCP is guaranteed. */
export const BATTLES_PER_SCP = 300
/** No SCP may Sweep (Neutralize half or more of the opposing team) in more than this share of its battles. */
export const MAX_SWEEP_RATE = 0.15
/** Every SCP's win rate must stay inside this band. */
export const WIN_RATE_BAND = [0.3, 0.7] as const
/** No full-budget team makeup (e.g. "EEES") may win more than this share. */
export const MAX_MAKEUP_WIN_RATE = 0.7
/** Every piece of Equipment's win rate must stay inside this band (the same as SCPs). */
export const EQUIPMENT_WIN_RATE_BAND = WIN_RATE_BAND
/**
 * Teams grouped by how much Team Budget they spent on Equipment must each win
 * inside this band: Equipment should be worth buying, but never mandatory.
 */
export const SPEND_WIN_RATE_BAND = [0.4, 0.6] as const
/** Makeups (and spending groups) with fewer battles than this are too noisy to judge. */
export const MIN_MAKEUP_SAMPLE = 100
/** Each type's count must be within this fraction of an even share (rounded to the nearest whole number). */
export const TYPE_SPREAD_TOLERANCE = 0.25

const pct = (n: number) => `${(n * 100).toFixed(1)}%`

/** Broken limits among the `focus` SCPs, the full-budget team makeups, and Equipment. */
export function balanceProblems(result: BalanceResult, focus: readonly string[]): string[] {
  const problems: string[] = []
  for (const id of focus) {
    const t = result.perScp[id]
    const win = t.wins / t.battles
    const sweep = t.sweeps / t.battles
    if (sweep > MAX_SWEEP_RATE) problems.push(`${id} sweeps in ${pct(sweep)} of battles (max ${pct(MAX_SWEEP_RATE)})`)
    if (win < WIN_RATE_BAND[0] || win > WIN_RATE_BAND[1]) {
      problems.push(`${id} wins ${pct(win)} (allowed ${pct(WIN_RATE_BAND[0])}–${pct(WIN_RATE_BAND[1])})`)
    }
  }
  for (const [makeup, m] of Object.entries(result.perMakeup)) {
    if (m.cost < TEAM_BUDGET - 1 || m.battles < MIN_MAKEUP_SAMPLE) continue
    const win = m.wins / m.battles
    if (win > MAX_MAKEUP_WIN_RATE) problems.push(`${makeup} teams win ${pct(win)} (max ${pct(MAX_MAKEUP_WIN_RATE)})`)
  }
  const outside = (win: number, [lo, hi]: readonly [number, number]) => win < lo || win > hi
  const band = ([lo, hi]: readonly [number, number]) => `${pct(lo)}–${pct(hi)}`
  for (const [id, t] of Object.entries(result.perEquipment)) {
    const win = t.wins / t.battles
    if (t.battles >= MIN_MAKEUP_SAMPLE && outside(win, EQUIPMENT_WIN_RATE_BAND)) {
      problems.push(`Equipment ${id} wins ${pct(win)} (allowed ${band(EQUIPMENT_WIN_RATE_BAND)})`)
    }
  }
  for (const [spend, t] of Object.entries(result.perSpend)) {
    const win = t.wins / t.battles
    if (t.battles >= MIN_MAKEUP_SAMPLE && outside(win, SPEND_WIN_RATE_BAND)) {
      problems.push(`Teams spending ${spend} extra points on Equipment win ${pct(win)} (allowed ${band(SPEND_WIN_RATE_BAND)})`)
    }
  }
  return problems
}

/** Ring types only: Mundane is left out of the spread check (it has no cap). */
export interface TypeCount {
  type: RingType
  /** SCPs that have this type. */
  scps: number
  /** Attacking-move slots of this type across every SCP's moveset. */
  moves: number
}

export interface TypeSpread {
  counts: TypeCount[]
  /** Allowed [min, max] for each type's SCP count and move count. */
  scpRange: [number, number]
  moveRange: [number, number]
}

/** Allowed range around an even share of `total` across the types, rounded to whole numbers. */
const rangeFor = (total: number): [number, number] => {
  const even = total / TYPE_RING.length
  return [Math.round(even * (1 - TYPE_SPREAD_TOLERANCE)), Math.round(even * (1 + TYPE_SPREAD_TOLERANCE))]
}

export function typeSpread(dex: Dex, roster: readonly string[]): TypeSpread {
  const counts = TYPE_RING.map((type) => ({ type, scps: 0, moves: 0 }))
  const at = (t: RingType) => counts[TYPE_RING.indexOf(t)]
  for (const id of roster) {
    const sp = dex.species[id]
    for (const t of sp.types) if (t !== MUNDANE) at(t).scps++
    for (const m of sp.moves) {
      const move = dex.moves[m]
      if (move.category !== 'Status' && move.type !== MUNDANE) at(move.type).moves++
    }
  }
  const sum = (k: 'scps' | 'moves') => counts.reduce((s, c) => s + c[k], 0)
  return { counts, scpRange: rangeFor(sum('scps')), moveRange: rangeFor(sum('moves')) }
}

/** Types whose SCP or move count is outside the allowed range. */
export function typeSpreadProblems(spread: TypeSpread): string[] {
  const out = (n: number, [lo, hi]: [number, number]) => n < lo || n > hi
  return spread.counts.flatMap((c) => [
    ...(out(c.scps, spread.scpRange) ? [`${c.type} is on ${c.scps} SCPs (allowed ${spread.scpRange.join('–')})`] : []),
    ...(out(c.moves, spread.moveRange) ? [`${c.type} has ${c.moves} attacking-move slots (allowed ${spread.moveRange.join('–')})`] : []),
  ])
}
