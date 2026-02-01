import { Locators } from "../locators";
import { BasePage } from "./basePage";

/**
 * Class representing the Invenio Login Page.
 * Provides methods for navigating, filling fields, and logging in.
 */

export class LoginPage<T extends Locators = Locators> extends BasePage<T> {
  /**
   * Navigate to the Login page.
   * @param options Optional parameters.
   * @param options.nextURL Optional URL to redirect after login.
   */
  async openPage(options?: { nextURL: string }): Promise<void> {
    if (options?.nextURL) {
      await this.page.goto(`/login/?next=${encodeURIComponent(options.nextURL)}`);
    } else {
      await this.page.goto("/login/");
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

  /**
   * Fills the username field.
   * @param username Username to enter in the username field.
   */
  async fillUsernameField(username: string): Promise<void> {
    const usernameInput = this.page.locator(this.locators.loginPage.usernameField);
    await usernameInput.fill(username);
    await this.expect(usernameInput).toHaveValue(username);
  }

  /**
   * Fills the password field.
   * @param password Password to enter in the password field.
   */
  async fillPasswordField(password: string): Promise<void> {
    const passwordInput = this.page.locator(this.locators.loginPage.passwordField);
    await passwordInput.fill(password);
    await this.expect(passwordInput).toHaveValue(password);
  }

  // BUTTONS -----------------------------------------------------------------------------

  /**
   * Submits the login form.
   * @param afterLoginPage Page instance expected after login.
   * @returns The expected page after performing the login.
   */
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
  async loginUser<S extends BasePage<T>>(
    username: string,
    password: string,
    afterLoginPage: S
  ): Promise<S> {
    await this.fillUsernameField(username);
    await this.fillPasswordField(password);
    return await this.submitLogin(afterLoginPage);
  }

  /**
   * Logs out the currently authenticated user via the header profile menu.
   */
  async logout(): Promise<void> {
    const profileButton = this.page.locator(
      this.locators.header.userProfileDropdownButton
    );
    await profileButton.waitFor({ state: "visible", timeout: 5000 });
    await profileButton.click();

    const logoutItem = this.page.locator(this.locators.header.logoutMenuItem);
    await logoutItem.waitFor({ state: "visible", timeout: 5000 });
    await logoutItem.click();

    await this.page.waitForLoadState("networkidle");
  }
}
