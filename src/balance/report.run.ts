/// <reference types="node" />
import { writeFileSync } from 'node:fs'
import { it } from 'vitest'
import { ROSTER, BALANCE_ORDER } from '../data/roster'
import { balanceReport } from './report'
import { BATTLES_PER_SCP } from './rules'
import { simulateBalance } from './simulate'

/**
 * `npm run balance`: simulate the whole roster and write balance-report.md.
 * Run through Vitest (vitest.balance.config.ts) so the roster's Vite-only
 * file discovery works. Not part of `npm test`.
 */
it('writes the balance report', () => {
  const result = simulateBalance(ROSTER, BALANCE_ORDER, BALANCE_ORDER, BATTLES_PER_SCP)
  const report = balanceReport(ROSTER, BALANCE_ORDER, result)
  writeFileSync('balance-report.md', report)
  // The O5 Council Member bot builds from these (src/ai/opponents.ts). Committed, regenerated each wave.
  const rate = (t: { wins: number; battles: number }) => Math.round((t.wins / t.battles) * 1000) / 1000
  const byId = (o: Record<string, { wins: number; battles: number }>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)).map(([id, t]) => [id, rate(t)]))
  const winRates = { scp: byId(result.perScp), equipment: byId(result.perEquipment) }
  writeFileSync('src/data/winRates.json', JSON.stringify(winRates, null, 2) + '\n')
  console.log(report)
}, 600_000)
