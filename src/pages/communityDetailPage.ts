import { expect } from "@playwright/test";
import { Locators } from "../locators";
import { BasePage } from "./basePage";

/**
 * Represents the Community Detail page.
 * Provides methods to interact with and verify elements of a specific community.
 */

export class CommunityDetailPage<T extends Locators = Locators> extends BasePage<T> {
  
  // NAVIGATION --------------------------------------------------------

  /**
   * Navigates to the Settings section.
   */
  async navigateToSettingsSection() {
    await this.page.click(this.locators.communityDetailPage.settingsTab);
  }

  /**
   * Navigates to the Records section.
   */
  async navigateToRecordsSection() {
    await this.page.click(this.locators.communityDetailPage.recordsTab);
  }

  /**
   * Navigates to the Members section.
   */
  async navigateToMembersSection() {
    await this.page.click(this.locators.communityDetailPage.membersTab);
  }

  /**
   * Navigates to the Curation Policy section.
   */
  async navigateToCurationPolicySection() {
    await this.page.click(this.locators.communityDetailPage.curationPolicyTab);
  }

  /**
   * Navigates to the About section.
   */
  async navigateToAboutSection() {
    await this.page.click(this.locators.communityDetailPage.aboutTab);
  }

  // FIELDS ------------------------------------------------------------

  /**
   * Edits the community name by appending '_EDITED'.
   * @returns The updated community name.
   */
  async editCommunityName(): Promise<string> {
    const nameField = this.page.locator(this.locators.communityDetailPage.communityNameInput);
    await nameField.waitFor({ state: "visible" });
    const currentName = await nameField.inputValue();
    const editedName = `${currentName}_EDITED`;
    await nameField.fill(editedName);
    console.log(`Updated community name to: ${editedName}`);
    return editedName;
  }

  /**
   * Fill the delete confirmation input with the community's identifier.
   */
  async fillDeleteConfirmationInput() {
    const identifier = await this.page
      .locator(this.locators.communityDetailPage.deleteIdentifierLabel)
      .textContent();
    if (identifier) {
      await this.page
        .locator(this.locators.communityDetailPage.deleteIdentifierInput)
        .fill(identifier);
      console.log(`Filled delete confirmation input with: ${identifier}`);
    }
  }

  /**
   * Select a member role checkbox by index.
   * @param index Index of the role checkbox to select.
   */
  async selectRoleByIndex(index: number): Promise<void> {
    await this.page.locator(this.locators.communityDetailPage.roleCheckbox(index)).click();
  }

  /**
   * Fill the Curation Policy editor with the provided text.
   * @param text Text to fill into the editor.
   */
  async fillCurationPolicy(text: string) {
    const iframe = this.page.frameLocator(
      `${this.locators.communityDetailPage.curationPolicyIframe} iframe`
    );
    const body = iframe.locator("body");
    await body.fill(text);
  }

  /**
   * Fill the About page editor with the provided text.
   * @param text Text to fill into the editor.
   */
  async fillAboutPage(text: string) {
    const iframe = this.page.frameLocator(
      `${this.locators.communityDetailPage.aboutPageIframe} iframe`
    );
    const body = iframe.locator("body");
    await body.fill(text);
  }

  /**
   * Get the current community header name text.
   * @returns The community name as a string.
   */
  async getCommunityHeaderName(): Promise<string> {
    const text = await this.page
      .locator(this.locators.communityDetailPage.headerCommunityName)
      .textContent();
    return text?.trim() ?? "";
  }

  // BUTTONS -----------------------------------------------------------

  /**
   * Clicks the Save button.
   */
  async clickSaveButton() {
    const btn = this.page.locator(this.locators.communityDetailPage.saveButton);
    await btn.waitFor({ state: "visible" });
    if (await btn.isEnabled()) await btn.click();
  }

  /**
   * Clicks the Delete Community button.
   */
  async clickDeleteCommunityButton() {
    await this.page.locator(this.locators.communityDetailPage.deleteCommunityButton).click();
  }

  /**
   * Click the Permanently Delete button to confirm deletion.
   */
  async clickPermanentlyDeleteButton() {
    const btn = this.page.locator(this.locators.communityDetailPage.permanentlyDeleteButton);
    await btn.waitFor({ state: "visible" });
    if (await btn.isEnabled()) await btn.click();
  }

  /**
   * Click the Invite button to open the invite dialog.
   */
  async clickInviteButton(): Promise<void> {
    await this.page.click(this.locators.communityDetailPage.inviteButton);
  }

  /**
   * Confirm the invitation by clicking the Invite button in the dialog.
   */
  async clickInviteButtonConfirmation() {
    await this.page.locator(this.locators.communityDetailPage.inviteConfirmButton).click();
  }

  // VERIFICATION ------------------------------------------------------

  /**
   * Verifies that the community name matches the expected value.
   * @param expectedName Expected community name to verify.
   */
  async verifyCommunityName(expectedName: string) {
    const locator = this.page.locator(this.locators.communityDetailPage.headerCommunityName);
    await expect(locator).toHaveText(expectedName);
  }

  /**
   * Verify that the community name contains the expected value (useful after edits).
   * @param expectedName Expected text within the community name.
   */
  async verifyUpdatedCommunityName(expectedName: string) {
    const locator = this.page.locator(this.locators.communityDetailPage.headerCommunityName);
    await expect(locator).toContainText(expectedName);
  }

  /**
   * Verify that the community is not present in the list.
   * @param name Name of the community expected to be absent.
   */
  async verifyCommunityNotPresent(name: string) {
    const locator = this.page.locator(`.community-list .community-item`, {
      hasText: name,
    });
    await expect(locator).toHaveCount(0);
  }
}
