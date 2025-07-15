import { InvenioTest} from '../fixtures';
import { expect } from '@playwright/test';

export function homepageTests(test: InvenioTest) {
    test.describe('Homepage Tests', () => {
        test.beforeEach(async ({ homePage }) => {
            await homePage.openPage();
        });

        test('should display the homepage logo', async ({ homePage }) => {
            await homePage.expectLogoVisible();
        });

        test('should navigate to search page from homepage', async ({ homePage, searchPage }) => {
            await homePage.fillSearchField('example query');
            expect(await homePage.submitSearch()).toBe(searchPage);
        });
    });
};