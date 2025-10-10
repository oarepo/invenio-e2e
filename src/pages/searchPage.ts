import { Locators } from '../locators';
import { BasePage } from './basePage';

/**
 * Class representing a search page with a list of search results.
 */

export class SearchPage<T extends Locators = Locators> extends BasePage<T> {

    /*
     * Navigate to the search results page.
     */
    async openPage(): Promise<void> {
        await this.page.goto('/search');
        await this.page.waitForLoadState("networkidle");
        await this.validatePageLoaded();
    }

    // VALIDATION

    /**
     * Validates that the search page has loaded by checking for the search result list.
     */
    async validatePageLoaded(): Promise<void> {
        await super.validatePageLoaded();
        await this.page.waitForSelector(this.locators.searchPage.searchResultList);
    }
}