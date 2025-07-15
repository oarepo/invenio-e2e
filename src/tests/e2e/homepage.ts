import { InvenioTest } from '../../fixtures';
import { expect } from '@playwright/test';
import { test_if_not_skipped } from './utils';

/**
 * Runs a set of tests for the homepage.
 * 
 * @param test - The InvenioTest instance to use for the tests.
 */
export function homepageTests(test: InvenioTest, options: { skip?: string[] } = {}) {
    const runner = test_if_not_skipped(test, "Homepage Tests", options.skip);

    // If Homepage Tests are skipped, return early
    if (!runner) {
        return;
    }

    test.describe('Homepage Tests', () => {
        test.beforeEach(async ({ homePage }) => {
            await homePage.openPage();
        });

        // using the "runner" instead of "test" directly will run the test only if it is not skipped
        runner('Should display the homepage logo', async ({ homePage }) => {
            await homePage.expectLogoVisible();
        });

        runner('Should navigate to search page from homepage', async ({ homePage, searchPage }) => {
            await homePage.fillSearchField('example query');
            expect(await homePage.submitSearch()).toBe(searchPage);
        });
    });
};