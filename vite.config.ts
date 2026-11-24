import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/Scp_Battler/ on GitHub Pages.
  base: '/Scp_Battler/',
  plugins: [react()],
  define: {
    // Online players must run the same build (lockstep, docs/adr/0002). CI sets GITHUB_SHA.
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(process.env.GITHUB_SHA?.slice(0, 12) ?? 'dev'),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
