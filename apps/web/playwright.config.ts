import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Route Crawling
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Run tests sequentially to avoid overwhelming dev server
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [["list"], ["html", { outputFolder: "tmp/playwright-report" }]],

  use: {
    baseURL: process.env.APP_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start dev server before tests (optional)
  // Uncomment if you want Playwright to automatically start the dev server
  // webServer: {
  //   command: "pnpm dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});

