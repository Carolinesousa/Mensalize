import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:5173'
// Em CI sempre sobe servidores novos; localmente reaproveita o que já estiver no ar.
const reuseExistingServer = !process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // API Laravel (SQLite já migrado via `php artisan migrate:fresh`).
      command: 'php artisan serve --port=8080',
      cwd: '../api',
      url: 'http://localhost:8080/up',
      timeout: 120_000,
      reuseExistingServer,
    },
    {
      // SPA Vite (faz proxy de /api e /sanctum para a API).
      command: 'npm run dev',
      url: baseURL,
      timeout: 120_000,
      reuseExistingServer,
    },
  ],
})
