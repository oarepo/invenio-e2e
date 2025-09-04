/**
 * This file is just for testing this library, it is not intended to be used for real repositories.
 * For those, please use invenio-cli init with the appropriate template.
 */
import { defineConfig, devices } from "@playwright/test";
import { appConfig } from "../src/config/env"; //  use centralized config

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Multiple reporters (console + HTML + Qase)
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ...(appConfig.qase
      ? [
          [
            "playwright-qase-reporter",
            {
              apiToken: appConfig.qase.token,
              projectCode: appConfig.qase.project,
              runName: `E2E Run - ${new Date().toISOString()}`,
              environment: appConfig.qase.environment,
              rootSuiteTitle: "Playwright E2E",
              runComplete: appConfig.qase.runComplete,
            } as const,
          ] as const,
        ]
      : []),
  ],

  use: {
    ignoreHTTPSErrors: true,
    baseURL: appConfig.baseURL, // use from env.ts
    trace: "on-first-retry",
    screenshot: "on-first-failure",
    video: "retain-on-failure",
    headless: process.env.CI ? true : false, // CI vs local
    launchOptions: {
      slowMo: process.env.CI ? 0 : 50,
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
