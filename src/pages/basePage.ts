import { expect, Page } from '@playwright/test';
import { Locators } from '../locators';
import { HomePage } from './homePage';

/**
 * Class representing extended search page with special footer.
 */

export class BasePage<T extends Locators = Locators> {
    /**
     * Creates a new instance of the abstract base page.
     * 
     * @param page  Playwright Page object representing the current page.
     * @param locators  An object containing locators for elements on the page.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor(
        protected page: Page,
        protected locators: T,
        protected availablePages: { [key: string]: object }
    ) { }

    // VALIDATION
    /**
     * Validates that the loaded page has a logo link in the header.
     */
    async validatePageLoaded(): Promise<void> {
        await this.page.waitForSelector(this.locators.header.logoLink);
    }

    /**
     * Validates that the logo is visible on the page.
     */
    async expectLogoVisible(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        const logo = this.page.locator(this.locators.header.logoLink);
        await expect(logo).toBeVisible();
    }

    // NAVIGATION
    /**
     * Navigates to the home page as we should always have a home page link in the header.
     * 
     * @returns the home page
     */
    async navigateToHomePage(): Promise<HomePage> {
        const logoLink = await this.page.locator(this.locators.header.logoLink);
        await logoLink.click();
        const homePage: HomePage = this.availablePages['homePage'] as HomePage;
        await homePage.validatePageLoaded();
        return homePage;
    }
}