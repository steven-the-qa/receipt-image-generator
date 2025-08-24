import { defineConfig, devices } from '@playwright/test';

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
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: true,
  },
});
