import { expect, Page } from '@playwright/test';
import { BASE_PAGE_LOCATORS, HOME_PAGE_LOCATORS } from '../locators';
import { SearchPage } from './searchPage';
import { BasePage } from './basePage';

/**
 * Class representing extended home page with special footer.
 */

export class HomePage extends BasePage {
    /**
     * Creates a new instance of the HomePage.
     * 
     * @param page  Playwright Page object representing the current page.
     * @param locators  An object containing locators for elements on the page.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor(
        page: Page, 
        basePageLocators: typeof BASE_PAGE_LOCATORS,
        protected homePageLocators: typeof HOME_PAGE_LOCATORS,
        availablePages: {[key: string]: object},
    ) {
        super(page, basePageLocators, availablePages);
    }
    
    /*
     * Navigate to the  Home page.
     */
    async open_page() {
        await this.page.goto('/');
        await this.validatePageLoaded();
    }

    // VALIDATION
    /**
     * Validates that the  User Profile page has loaded by checking for a specific locator.
     */
    async validatePageLoaded(): Promise<void> {
        await this.page.waitForSelector(this.homePageLocators.searchField);
    }

    // FIELDS ------------------------------------------------------------------------------

    // Method to fill in the search field
    async fillSearchField(query: string): Promise<void> {
        const searchInput = this.page.locator(this.homePageLocators.searchField);
        await searchInput.fill(query);
        await expect(searchInput).toHaveValue(query);
    }


    // BUTTONS -----------------------------------------------------------------------------

    // Method to submit the search
    async submitSearch(): Promise<SearchPage> {
        const submitButton = this.page.locator(this.homePageLocators.searchButton);
        await submitButton.click();
        await this.page.waitForLoadState("networkidle");
        const nextPage: SearchPage = this.availablePages['searchPage'] as SearchPage;
        await nextPage.validatePageLoaded();
        return nextPage;
    }
}