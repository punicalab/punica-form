import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4176' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // The production build: what users of the packages ship
  webServer: {
    command: 'pnpm build && pnpm preview',
    url: 'http://localhost:4176',
    reuseExistingServer: !process.env.CI
  }
});
