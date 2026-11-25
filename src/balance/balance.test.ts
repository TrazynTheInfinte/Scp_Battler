import { describe, expect, it } from 'vitest'
import { ROSTER, ROSTER_ORDER, SCPS } from '../data/roster'
import { BATTLES_PER_SCP, balanceProblems, typeSpread, typeSpreadProblems } from './rules'
import { simulateBalance } from './simulate'

/**
 * Balance gate (docs/adr/0003), run in CI: the newest wave's SCPs each get
 * BATTLES_PER_SCP battles against the whole roster, and must stay inside the
 * limits in rules.ts. `npm run balance` covers every SCP.
 */
const newestWave = Math.max(...SCPS.map((s) => s.wave))
const focus = SCPS.filter((s) => s.wave === newestWave).map((s) => s.id)

describe(`balance gate (wave ${newestWave}: ${focus.length} SCPs)`, () => {
  it('every type is spread evenly enough across SCPs and moves', () => {
    expect(typeSpreadProblems(typeSpread(ROSTER, ROSTER_ORDER))).toEqual([])
  })

  it('no sweeps over the limit, win rates in the band, and no dominant team makeup', () => {
    const result = simulateBalance(ROSTER, ROSTER_ORDER, focus, BATTLES_PER_SCP)
    // Equipment spending bands are judged in the full report only (see balanceProblems).
    expect(balanceProblems(result, focus, { spendBands: false })).toEqual([])
    expect(result.timeouts / result.battles).toBeLessThan(0.02)
  }, 120_000)
})
