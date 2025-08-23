import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx serve -s build -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chrome',
      testIgnore: 'api/**',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testIgnore: 'api/**',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'safari',
      testIgnore: 'api/**',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'api',
      testMatch: 'api/**',
    },
  ],
});
