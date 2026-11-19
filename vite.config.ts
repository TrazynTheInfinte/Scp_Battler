import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/Scp_Battler/ on GitHub Pages.
  base: '/Scp_Battler/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
