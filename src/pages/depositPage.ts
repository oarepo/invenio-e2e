import { Locators } from '../locators';
import { BasePage } from './basePage';
import { PreviewPage } from './previewPage';

/**
 * Class representing a deposit page.
 */

export class DepositPage<T extends Locators = Locators> extends BasePage<T> {

    /*
     * Navigate to the Deposit page.
     * @returns The deposit page instance.
     */
    async openPage(url?: string): Promise<void> {
        // TODO: if no url, new deposition
        await this.page.goto('/');
        await this.page.waitForLoadState("networkidle");
        await this.validatePageLoaded();
    }

    // VALIDATION
    /**
     * Validates that the deposit page has loaded.
     */
    async validatePageLoaded(): Promise<void> {
        await super.validatePageLoaded();
    }

    // FIELDS ------------------------------------------------------------------------------

    // Method to fill in the deposit form fields

    // BUTTONS -----------------------------------------------------------------------------

    async clickPreview(): Promise<PreviewPage> {
        throw new Error('Method not implemented. Please implement the clickPreview method to navigate to the preview page.');
    }

    // FLOWS ------------------------------------------------------------------------------

    /**
    async fillAndSubmit(data: Record<string, any>): Promise<DepositPage> {

    }
     */
}