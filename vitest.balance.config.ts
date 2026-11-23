import { defineConfig } from 'vitest/config'

// `npm run balance`: only the full balance report (src/balance/report.run.ts).
export default defineConfig({
  test: {
    include: ['src/balance/report.run.ts'],
  },
})
