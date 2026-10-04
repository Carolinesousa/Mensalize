import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:8080', '/sanctum': 'http://localhost:8080' } },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    globals: true,
    // Os testes E2E do Playwright ficam em e2e/ e não rodam no Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
