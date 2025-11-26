/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvenioTest } from '../../fixtures';
import { expect } from '@playwright/test';

/**
 * Runs a set of tests for the login page.
 * @param test The InvenioTest instance to use for the tests.
 */
export function loginTests(test: InvenioTest) {
    // If Login Tests are skipped, return early

    test.describe('Login Tests', () => {
        // using the "runner" instead of "test" directly will run the test only if it is not skipped
        test('Login user', async ({ loginPage, homePage, availablePages }) => {
            // Open the login page
            await homePage.openPage();
            const loggedInHomePage = await homePage.login()
            expect(loggedInHomePage).toBe(homePage);
        });

        test('Logged in fixture works', async ({ defaultUserLoggedIn, loginService }) => {
            expect(await loginService.isUserLoggedIn()).toBeTruthy();
        });
    });
};