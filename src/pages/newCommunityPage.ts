import { BasePage } from "./basePage";
import { Locators } from "../locators";
import { expect } from "@playwright/test";

/**
 * Class representing the New Community creation page.
 * Provides methods for filling fields, selecting visibility, creating a community,
 * and verifying the created community name.
 */

export class NewCommunityPage<T extends Locators = Locators> extends BasePage<T> {
  
  // NAVIGATION --------------------------------------------------------------------------



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
    await this.page.locator(this.locators.newCommunityPage.newCommunityButton).click();
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
    await this.page.locator(this.locators.newCommunityPage.restrictedRadio).check();
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
   * @returns Locator for the community name header element.
   */
  getCommunityName() {
    return this.page.locator(this.locators.newCommunityPage.communityNameHeader);
  }


  async verifyCommunityName(expectedName: string, index: number = 0): Promise<void> {
    const communityNameElement = this.page
      .locator('a.ui.fluid.card[href^="/communities/"] div.content > div.header')
      .nth(index);

    await expect(communityNameElement).toHaveText(expectedName);
  }
}
