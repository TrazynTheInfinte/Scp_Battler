/// <reference types="node" />
import { writeFileSync } from 'node:fs'
import { it } from 'vitest'
import { ROSTER, ROSTER_ORDER } from '../data/roster'
import { balanceReport } from './report'
import { BATTLES_PER_SCP } from './rules'
import { simulateBalance } from './simulate'

/**
 * `npm run balance`: simulate the whole roster and write balance-report.md.
 * Run through Vitest (vitest.balance.config.ts) so the roster's Vite-only
 * file discovery works. Not part of `npm test`.
 */
it('writes the balance report', () => {
  const result = simulateBalance(ROSTER, ROSTER_ORDER, ROSTER_ORDER, BATTLES_PER_SCP)
  const report = balanceReport(ROSTER, ROSTER_ORDER, result)
  writeFileSync('balance-report.md', report)
  console.log(report)
}, 600_000)
