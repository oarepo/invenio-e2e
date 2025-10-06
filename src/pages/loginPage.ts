import { Locators } from '../locators';
import { BasePage } from './basePage';

/**
 * Class representing invenio login page.
 */

export class LoginPage<T extends Locators = Locators> extends BasePage<T> {

    /**
     * Navigate to the Login page.
     * @returns The login page instance to allow method chaining.
     */
    async openPage(options?: { nextURL: string }): Promise<void> {
        if (options?.nextURL) {
            await this.page.goto(`/login/?next=${encodeURIComponent(options.nextURL)}`);
        } else {
            await this.page.goto('/login/');
        }
        await this.page.waitForLoadState("networkidle");
        await this.validatePageLoaded();
    }

    // VALIDATION

    /**
     * Validates that the login page has loaded by checking for the username and password fields.
     */
    async validatePageLoaded(): Promise<void> {
        await super.validatePageLoaded();
        await this.page.waitForSelector(this.locators.loginPage.usernameField);
        await this.page.waitForSelector(this.locators.loginPage.passwordField);
    }

    // FIELDS ------------------------------------------------------------------------------

    // Method to fill in the username field
    async fillUsernameField(username: string): Promise<void> {
        const usernameInput = this.page.locator(this.locators.loginPage.usernameField);
        await usernameInput.fill(username);
        await this.expect(usernameInput).toHaveValue(username);
    }

    // Method to fill in the password field
    async fillPasswordField(password: string): Promise<void> {
        const passwordInput = this.page.locator(this.locators.loginPage.passwordField);
        await passwordInput.fill(password);
        await this.expect(passwordInput).toHaveValue(password);
    }


    // BUTTONS -----------------------------------------------------------------------------

    // Method to submit the login
    async submitLogin<S extends BasePage<T>>(afterLoginPage: S): Promise<S> {
        const submitButton = this.page.locator(this.locators.loginPage.submitButton);
        await submitButton.click();
        await this.page.waitForLoadState("networkidle");
        await afterLoginPage.validatePageLoaded();
        return afterLoginPage;
    }

    // FLOWS ------------------------------------------------------------------------------

    /**
     * Performs a log in operation by filling the username and password fields 
     * and submitting the login.
     * @param username The username to fill in the username field.
     * @param password The password to fill in the password field.
     * @param afterLoginPage The page instance expected after login.
     * @returns The expected page after performing the login.
     */
    async loginUser<S extends BasePage<T>>(username: string, password: string, afterLoginPage: S): Promise<S> {
        await this.fillUsernameField(username);
        await this.fillPasswordField(password);
        return await this.submitLogin(afterLoginPage);
    }
}