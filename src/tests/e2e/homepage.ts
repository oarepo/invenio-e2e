import { InvenioTest } from '../../fixtures';
import { expect } from '@playwright/test';

/**
 * Runs a set of tests for the homepage.
 * @param test The InvenioTest instance to use for the tests.
 */
export function homepageTests(test: InvenioTest) {

    test.describe('Homepage Tests', () => {
        test.beforeEach(async ({ homePage }) => {
            await homePage.openPage();
        });

        // using the "runner" instead of "test" directly will run the test only if it is not skipped
        test('Should display the homepage logo', async ({ homePage }) => {
            await homePage.expectLogoVisible();
        });

        test('Should navigate to search page from homepage', async ({ homePage, searchPage }) => {
            await homePage.fillSearchField('example query');
            expect(await homePage.submitSearch()).toBe(searchPage);
        });
    });
};