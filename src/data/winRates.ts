import type { WinRates } from '../ai/opponents'
import data from './winRates.json'

/**
 * Each SCP's and Equipment piece's win rate from the last full balance
 * report. `npm run balance` rewrites winRates.json; commit it with each wave
 * (a test fails while any SCP is missing). The O5 Council Member bot builds
 * its teams from these.
 */
export const WIN_RATES: WinRates = data
