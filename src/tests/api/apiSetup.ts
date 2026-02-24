import { test as setup } from '../../fixtures';
import { expect } from '@playwright/test';

import fs from 'fs';
import { LoginPage } from '../../pages';

/**
 * Registers the authentication setup needed before running API tests.
 *
 * The helper signs in through the UI once, stores the resulting authenticated
 * Playwright storage state, and makes it available to subsequent API tests.
 * @param username Login email for authentication in the tested application.
 * @param password Login password for authentication in the tested application.
 * @param authFilePath Absolute path where the authenticated storage
 * state should be saved. Defaults to `playwright/.auth/{user|admin}.json` inside the project.
 */
export function authenticateUserForApiTesting(username: string, password: string, authFilePath: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setup(`Authenticate as ${username} for API Testing`, async ({ loginPage, homePage, page }) => {
    await homePage.openPage();
    const loggedInHomePage = await homePage.login({ username, password });
    expect(loggedInHomePage).toBe(homePage);
    // End of authentication steps.

    // Save the authenticated context
    await page.context().storageState({ path: authFilePath });
  });
};


/**
 * Registers the cleanup steps after running API tests.
 *
 * The helper logs out through the UI to invalidate the session and deletes the
 * authenticated storage state file created for API tests.
 * @param username Login email for which the cleanup will be performed.
 * @param authFilePath Absolute path where the authenticated storage state is saved.
 */
export function apiTestingCleanup(username: string, authFilePath: string) {
  setup(`Logout and cleanup auth file for user ${username}`, async ({ browser, availablePages, expect, locators, services }) => {
    // Log out through UI
    const context = await browser.newContext({ storageState: authFilePath });
    const page = await context.newPage();
    const loginPage = new LoginPage({ availablePages, services, expect, locators, page });
    await page.goto('/');
    await loginPage.logout();

    // Delete the auth file after tests
    if (fs.existsSync(authFilePath)) {
      fs.unlinkSync(authFilePath);
    }
  });
};
