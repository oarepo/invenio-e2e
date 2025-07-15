import { expect, Page } from '@playwright/test';
import { BASE_PAGE_LOCATORS, SEARCH_PAGE_LOCATORS } from '../locators';
import { BasePage } from './basePage';

/**
 * Class representing extended search page with special footer.
 */

export class SearchPage extends BasePage {
    /**
     * Creates a new instance of the ExtendedHomePage.
     * 
     * @param page  Playwright Page object representing the current page.
     * @param locators  An object containing locators for elements on the page.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor(
        page: Page, 
        basePageLocators: typeof BASE_PAGE_LOCATORS,
        protected searchPageLocators: typeof SEARCH_PAGE_LOCATORS,
        availablePages: {[key: string]: object}
    ) {
        super(page, basePageLocators, availablePages);
    }
    
    /*
     * Navigate to the  Home page.
     */
    async open_page() {
        await this.page.goto('/search');
        await this.validatePageLoaded();
    }

    // VALIDATION
    /**
     * Validates that the  User Profile page has loaded by checking for a specific locator.
     */
    async validatePageLoaded(): Promise<void> {
        await this.page.waitForSelector(this.searchPageLocators.searchResultList);
    }
}