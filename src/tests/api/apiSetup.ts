import { test as setup } from '../../fixtures';
import { expect } from '@playwright/test';

import fs from 'fs';

/**
 * Registers the authentication setup needed before running API tests.
 *
 * The helper signs in through the UI once, stores the resulting authenticated
 * Playwright storage state, and makes it available to subsequent API tests.
 * @param authFilePath Absolute path where the authenticated storage
 * state should be saved. Defaults to `playwright/.auth/user.json` inside the project.
 */
export function setupApiTesting(authFilePath: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup('Authentication for API Testing', async ({ loginPage, homePage, page }) => {
    await homePage.openPage();
    const loggedInHomePage = await homePage.login();
    expect(loggedInHomePage).toBe(homePage);
    // End of authentication steps.

    // Save the authenticated context
    await page.context().storageState({ path: authFilePath });
  });
};

export function apiTestingCleanup(authFilePath: string) {
  setup('API Testing Teardown', () => {
    // Delete the auth file after tests
    if (fs.existsSync(authFilePath)) {
      fs.unlinkSync(authFilePath);
    }
  });
};
