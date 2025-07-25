import { Locators } from '../locators';
import { SearchPage } from './searchPage';
import { BasePage } from './basePage';

/**
 * Class representing a home page with search functionality.
 */

export class HomePage<T extends Locators = Locators> extends BasePage<T> {

    /*
     * Navigate to the Home page.
     * @returns The home page instance to allow method chaining.
     */
    async openPage(): Promise<void> {
        await this.page.goto('/');
        await this.page.waitForLoadState("networkidle");
        await this.validatePageLoaded();
    }

    // VALIDATION
    /**
     * Validates that the home page has loaded by checking for the search field.
     */
    async validatePageLoaded(): Promise<void> {
        await super.validatePageLoaded();
        await this.page.waitForSelector(this.locators.homePage.searchField);
    }

    // FIELDS ------------------------------------------------------------------------------

    // Method to fill in the search field
    async fillSearchField(query: string): Promise<void> {
        const searchInput = this.page.locator(this.locators.homePage.searchField);
        await searchInput.fill(query);
        await this.expect(searchInput).toHaveValue(query);
    }


    // BUTTONS -----------------------------------------------------------------------------

    // Method to submit the search
    async submitSearch(): Promise<SearchPage> {
        const submitButton = this.page.locator(this.locators.homePage.searchButton);
        await submitButton.click();
        await this.page.waitForLoadState("networkidle");
        const nextPage = this.availablePages.searchPage;
        await nextPage.validatePageLoaded();
        return nextPage;
    }

    // FLOWS ------------------------------------------------------------------------------

    /**
     * Performs a search operation by filling the search field and submitting the search.
     * 
     * @param query  The search query to fill in the search field.
     * @returns The search page after performing the search.
     */
    async performSearch(query: string): Promise<SearchPage> {
        await this.fillSearchField(query);
        return await this.submitSearch();
    }
}