import { BasePage } from "./basePage";
import { Locators } from "../locators";

/**
 * Class representing the New Community creation page.
 */

export class NewCommunityPage<T extends Locators = Locators> extends BasePage<T> {

  // NAVIGATION --------------------------------------------------------------------------

  /**
   * Navigates to the home page.
   */
  async navigateToHome() {
    await this.page.goto("/");
  }

  /**
   * Navigate to the user dashboard page.
   */
  async navigateToMyDashboard() {
    await this.page.goto("/me");
  }

  /**
   * Navigate to the detail of the first record in the dashboard.
   */
  async firstRecordDetail() {
    await this.page
      .locator(this.locators.myDashboardPage.firstRecordDetail)
      .click();
  }

  // FIELDS ------------------------------------------------------------------------------

  /**
   * Fills in the Community Name field.
   * @param name Optional custom name to use. If not provided, generates a random one from test data.
   * @returns The community name that was filled.
   */
  async fillCommunityName(name: string) {
    await this.page
      .locator(this.locators.newCommunityPage.communityNameField)
      .fill(name);
    return name;
  }

  /**
   * Fills in the Community Identifier field.
   * @param identifier Optional custom identifier to use. If not provided, generates a random one from test data.
   * @returns The community identifier that was filled.
   */
  async fillCommunityIdentifier(identifier?: string) {
    const id = identifier ?? `community_${Math.floor(Math.random() * 1000000)}`;
    await this.page
      .locator(this.locators.newCommunityPage.communityIdentifierField)
      .fill(id);
    return id;
  }

  // BUTTONS -----------------------------------------------------------------------------

  /**
   * Clicks the "New Community" button.
   */
  async clickNewCommunityButton() {
    await this.page
      .locator(this.locators.newCommunityPage.newCommunityButton)
      .click();
  }

  /**
   * Selects the "Public" community visibility option.
   */
  async selectPublicCommunity() {
    await this.page.locator(this.locators.newCommunityPage.publicRadio).check();
  }

  /**
   * Selects the "Restricted" community visibility option.
   */
  async selectRestrictedCommunity() {
    await this.page
      .locator(this.locators.newCommunityPage.restrictedRadio)
      .check();
  }

  /**
   * Clicks the "Create Community" button.
   */
  async clickCreateCommunity() {
    await this.page
      .locator(this.locators.newCommunityPage.createCommunityButton)
      .click();
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Gets the locator for the created community name header.
   */
  getCommunityName() {
    return this.page.locator(
      this.locators.newCommunityPage.communityNameHeader
    );
  }

  /**
   * Verifies that the created community name matches the expected name.
   * @param expectedName The expected community name to verify.
   */
  async verifyCommunityName(expectedName: string) {
    const locator = this.getCommunityName();
    await locator.waitFor({ state: "visible" });
    const actualName = await locator.textContent();
    if (actualName?.trim() !== expectedName) {
      throw new Error(
        `Expected community name "${expectedName}", but got "${actualName}"`
      );
    }
  }
}
