import { defineConfig, devices } from '@playwright/test';

// Determine which server to start based on test type
const isApiTest = process.argv.includes('--project=api');

export default defineConfig({
  testDir: './test/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list", { printSteps: true }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "api",
      testMatch: /api\/.*\.spec\.ts/,
      use: {
          ...devices["Desktop Chrome"],
          userAgent: "Playwright API",
          channel: "chromium",
      },
  },
  {
      name: "chrome",
      testMatch: /^(?!.*api\/).*\.spec\.ts$/,
      use: {
          ...devices["Desktop Chrome"],
          userAgent: "Playwright Chrome",
          permissions: ["clipboard-read", "clipboard-write"],
          channel: "chromium", // uses "New Headless" in Playwright 1.49: https://playwright.dev/docs/release-notes#try-new-chromium-headless
      },
  },
  {
      name: "safari",
      testMatch: /^(?!.*api\/).*\.spec\.ts$/,
      use: {
          ...devices["Desktop Safari"],
          userAgent: "Playwright Safari",
          permissions: ["clipboard-read"],
          browserName: "webkit",
      },
  },
  {
      name: "firefox",
      testMatch: /^(?!.*api\/).*\.spec\.ts$/,
      use: {
          ...devices["Desktop Firefox"],
          userAgent: "Playwright Firefox",
          launchOptions: {
              firefoxUserPrefs: {
                  "dom.events.asyncClipboard.readText": true,
                  "dom.events.testing.asyncClipboard": true,
              },
          },
          browserName: "firefox",
      },
  },
  // {
  //     name: "edge",
  //     testMatch: /^(?!.*api\/).*\.spec\.ts$/,
  //     use: { ...devices["Desktop Edge"], userAgent: "Playwright Edge", channel: "msedge" },
  // },
  // {
  //     name: "mobile-safari",
  //     testMatch: /^(?!.*api\/).*\.spec\.ts$/,
  //     use: { ...devices["iPhone 14"], userAgent: "Playwright iOS" },
  // },
  // {
  //     name: "mobile-chrome",
  //     testMatch: /^(?!.*api\/).*\.spec\.ts$/,
  //     use: { ...devices["Pixel 7"], userAgent: "Playwright Android", channel: "chromium" },
  // },
  ],
  // Conditionally start servers based on test type:
  // - API tests: Start netlify dev (runs React on 3000 + Functions proxy on 8888, checks 8888 for readiness)
  // - E2E tests: Start React only on 3000
  webServer: isApiTest ? {
    command: 'npm run netlify:dev',
    port: 8888, // Check Netlify Functions proxy port for readiness
    reuseExistingServer: true,
    timeout: 120 * 1000,
  } : {
    command: 'npm run start',
    port: 3000, // Check React dev server port for readiness
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
