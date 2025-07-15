import { expect, Page } from '@playwright/test';
import { BASE_PAGE_LOCATORS } from '../locators';
import { HomePage } from './homePage';

/**
 * Class representing extended search page with special footer.
 */

export class BasePage {
    /**
     * Creates a new instance of the abstract base page.
     * 
     * @param page  Playwright Page object representing the current page.
     * @param locators  An object containing locators for elements on the page.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor(
        protected page: Page, 
        protected basePageLocators: typeof BASE_PAGE_LOCATORS,
        protected availablePages: {[key: string]: object}
    ) {}
    
    // VALIDATION
    /**
     * Validates that the  User Profile page has loaded by checking for a specific locator.
     */
    async validatePageLoaded(): Promise<void> {
        await this.page.waitForSelector(this.basePageLocators.logoLink);
    }

    async expectLogoVisible(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        const logo = this.page.locator(this.basePageLocators.logoLink);
        await expect(logo).toBeVisible();
    }

    // NAVIGATION

    async navigateToHomePage(): Promise<HomePage> {
        const logoLink = this.page.locator(this.basePageLocators.logoLink);
        await logoLink.click();
        const homePage: HomePage = this.availablePages['homePage'] as HomePage;
        await homePage.validatePageLoaded();
        return homePage;
    }
}