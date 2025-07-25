import { InvenioTest } from '../../fixtures';
import { expect } from '@playwright/test';
import { test_if_not_skipped } from './utils';

/**
 * Runs a set of tests for the login page.
 * 
 * @param test - The InvenioTest instance to use for the tests.
 */
export function loginTests(test: InvenioTest, options: { skip?: string[] } = {}) {
    const runner = test_if_not_skipped(test, "Login Tests", options.skip);

    // If Login Tests are skipped, return early
    if (!runner) {
        return;
    }

    test.describe('Login Tests', () => {
        // using the "runner" instead of "test" directly will run the test only if it is not skipped
        runner('Login user', async ({ loginPage, homePage, availablePages }) => {
            // Open the login page
            await homePage.openPage();
            const hp = await homePage.login()
            expect(hp).toBe(homePage);
        });

        runner('Logged in fixture works', async ({ defaultUserLoggedIn, loginService }) => {
            expect(loginService.isUserLoggedIn()).toBeTruthy();
        });
    });
};