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

  /**
   * Navigates to the Privileges section within community settings.
   */
  async navigateToPrivilegesSection(): Promise<void> {
    await this.page.click(this.locators.communityDetailPage.privilegesTab);
  }

  // FIELDS ------------------------------------------------------------

  /**
   * Edits the community name by appending '_EDITED'.
   * @returns The updated community name.
   */
  async editCommunityName(): Promise<string> {
    const nameField = this.page.locator(
      this.locators.communityDetailPage.communityNameInput
    );
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
    await this.page
      .locator(this.locators.communityDetailPage.roleCheckbox(index))
      .click();
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
    await this.page
      .locator(this.locators.communityDetailPage.deleteCommunityButton)
      .click();
  }

  /**
   * Click the Permanently Delete button to confirm deletion.
   */
  async clickPermanentlyDeleteButton() {
    const btn = this.page.locator(
      this.locators.communityDetailPage.permanentlyDeleteButton
    );
    await btn.waitFor({ state: "visible" });
    if (await btn.isEnabled()) await btn.click();
  }

  /**
   * Confirms deletion of community members in the delete dialog.
   */
  async clickMembersConfirmCheckbox(): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.deleteMembersCheckbox)
      .click();
  }

  /**
   * Confirms deletion of community records in the delete dialog.
   */
  async clickRecordsConfirmCheckbox(): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.deleteRecordsCheckbox)
      .click();
  }

  /**
   * Confirms deletion of community slug in the delete dialog.
   */
  async clickSlugConfirmCheckbox(): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.deleteSlugCheckbox)
      .click();
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
    await this.page
      .locator(this.locators.communityDetailPage.inviteConfirmButton)
      .click();
  }

  /**
   * Saves changes in the Privileges section.
   */
  async clickSaveButtonPrivileges(): Promise<void> {
    const btn = this.page.locator(
      this.locators.communityDetailPage.saveButtonPrivileges
    );
    await btn.waitFor({ state: "visible" });
    if (await btn.isEnabled()) await btn.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Sets community visibility in the Privileges section.
   * @param visibility Visibility option to select ("Restricted", "Public", "Hidden").
   */
  async setCommunityVisibility(
    visibility: "Restricted" | "Public" | "Hidden"
  ): Promise<void> {
    const dropdown = this.page.locator(
      this.locators.communityDetailPage.visibilityDropdown
    );

    await dropdown.waitFor({ state: "visible" });
    await dropdown.click();

    const option = this.page.getByRole("option", { name: visibility });
    await option.waitFor({ state: "visible" });
    await option.click();

    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Toggles an access status checkbox in the community records filters.
   * @param status Access status name (e.g., "Embargoed", "Metadata-only", "Open").
   */
  async toggleAccessStatusCheckbox(status: string): Promise<void> {
    const checkbox = this.page.locator(
      this.locators.communityDetailPage.accessStatusCheckbox(status)
    );

    await checkbox.waitFor({ state: "visible" });
    await checkbox.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Verifies that the results count label with the given number is visible.
   * @param expectedNumber Expected number shown in the results count label.
   * @returns True if visible, otherwise false.
   */
  async isNumberPresent(expectedNumber: number): Promise<boolean> {
    const label = this.page.locator(this.locators.communityDetailPage.numberLabel, {
      hasText: String(expectedNumber),
    });

    return (await label.count()) > 0;
  }

  // VERIFICATION ------------------------------------------------------

  /**
   * Verifies that the community name matches the expected value.
   * @param expectedName Expected community name to verify.
   */
  async verifyCommunityName(expectedName: string) {
    const locator = this.page.locator(
      this.locators.communityDetailPage.headerCommunityName
    );
    await expect(locator).toHaveText(expectedName);
  }

  /**
   * Verify that the community name contains the expected value (useful after edits).
   * @param expectedName Expected text within the community name.
   */
  async verifyUpdatedCommunityName(expectedName: string): Promise<void> {
    // Ensure we are on the Settings page where the name input exists
    await this.navigateToSettingsSection();

    const nameField = this.page.locator(
      this.locators.communityDetailPage.communityNameInput
    );

    await expect(nameField).toHaveValue(expectedName, { timeout: 15000 });
  }

  /**
   * Verifies that the record date tag label is visible on the community Records page.
   */
  async verifyDateTag(): Promise<void> {
    const label = this.page.locator(
      this.locators.communityDetailPage.recordDateTagLabel
    );
    await expect(label.first()).toBeVisible();
  }
}
