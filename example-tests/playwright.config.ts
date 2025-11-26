/**
 * This file is just for testing this library, it is not intended to be used for real repositories.
 * For those, please use invenio-cli init with the appropriate template.
 */

import { defineConfig, devices } from '@playwright/test';
import { appConfig } from "../src/config"; //  use centralized config

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Rename default test directory to repository tests directory
  testDir: '.',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Set global timeout for each test */
  timeout: 10_000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // Multiple reporters (console + HTML + Qase)
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ...(appConfig?.qase
      ? [
          [
            "playwright-qase-reporter",
            {
              apiToken: appConfig.qase.apiToken,
              projectCode: appConfig.qase.projectCode,
              runName: appConfig.qase.runName || `E2E Run - ${new Date().toISOString()}`,
              environment: appConfig.qase.environment,
              rootSuiteTitle: appConfig.qase.rootSuiteTitle,
              runComplete: appConfig.qase.runComplete,
            },
          ] as const,
        ]
      : []),
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ignoreHTTPSErrors: true,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: appConfig.baseURL, // use from env.ts
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Create a screenshot of a failure */
    screenshot: 'on-first-failure',
    /* Record video of a failure */
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false, // CI vs local
    launchOptions: {
      slowMo: process.env.CI ? 0 : 50,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testIgnore: /api\/.*/,
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* API Testing */
    { name: 'API Testing Setup', 
      testMatch: /api\/.*\.setup\.ts$/ 
    },
    {
      name: 'API',
      testMatch: /api\/.*\.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['API Testing Setup'],
    },

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
