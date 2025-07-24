import { Locators } from '../locators';
import { BasePage } from './basePage';

/**
 * Class representing a preview page.
 */

export class PreviewPage<T extends Locators = Locators> extends BasePage<T> {

    /*
     * Navigate to the Home page.
     * @returns The home page instance to allow method chaining.
     */
    async openPage(url: string): Promise<void> {
        await this.page.goto(url);
        await this.page.waitForLoadState("networkidle");
        await this.validatePageLoaded();
    }

    // VALIDATION
    /**
     * Validates that the home page has loaded by checking for the search field.
     */
    async validatePageLoaded(): Promise<void> {
        await super.validatePageLoaded();
    }

    // FIELDS ------------------------------------------------------------------------------


    // BUTTONS -----------------------------------------------------------------------------


    // FLOWS ------------------------------------------------------------------------------

}