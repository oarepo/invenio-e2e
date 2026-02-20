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

  async navigateToFirstRecord(): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.firstRecordLink)
      .first()
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToRequestsSection(): Promise<void> {
    await this.page.locator(this.locators.communityDetailPage.requestsTab).click();
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToReviewPolicy(): Promise<void> {
    await this.page.click(this.locators.communityDetailPage.reviewPolicyTab);
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToPages(): Promise<void> {
    await this.page.click(this.locators.communityDetailPage.pagesTab);
    await this.page.waitForLoadState("networkidle");
  }

  async navigateToClosedRequests(): Promise<void> {
    await this.page.click(this.locators.communityDetailPage.closedRequestsButton);
    await this.page.waitForLoadState("networkidle");
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

  async openInvitationsTab(): Promise<void> {
    await this.page.locator(this.locators.communityDetailPage.invitationsTab).click();
    await this.page.waitForLoadState("networkidle");
  }

  async inviteMember(
    email: string,
    role: "Reader" | "Curator" | "Manager" | "Owner"
  ): Promise<void> {
    await this.clickInviteButton();

    const input = this.page.locator(
      this.locators.communityDetailPage.memberDropdownInput
    );
    await input.waitFor({ state: "visible", timeout: 15000 });
    await input.fill(email);

    const suggestion = this.page.locator(
      this.locators.communityDetailPage.memberSuggestion(email)
    );
    await suggestion.waitFor({ state: "visible", timeout: 15000 });
    await suggestion.click();

    const roleDropdown = this.page.locator(
      this.locators.communityDetailPage.roleDropdown
    );
    if (await roleDropdown.isVisible().catch(() => false)) {
      await roleDropdown.click();
      await this.page
        .locator(this.locators.communityDetailPage.memberRoleOption(role))
        .click();
    }

    await this.clickInviteButtonConfirmation();
    await this.page.waitForLoadState("networkidle");
  }

  async isInvitationPresent(email: string): Promise<boolean> {
    return (
      (await this.page
        .locator(this.locators.communityDetailPage.invitationRowByEmail(email))
        .count()) > 0
    );
  }

  async isYouLabelPresent(): Promise<boolean> {
    return await this.page
      .locator(this.locators.communityDetailPage.youLabel)
      .isVisible();
  }

  async leaveCommunity(): Promise<void> {
    await this.page.locator(this.locators.communityDetailPage.leaveButton).click();
    const confirm = this.page.locator(
      this.locators.communityDetailPage.leaveConfirmButton
    );
    await confirm.waitFor({ state: "visible", timeout: 15000 });
    await confirm.click();
    await this.page.waitForLoadState("networkidle");
  }

  async isLeaveCommunityMessageVisible(): Promise<boolean> {
    return await this.page
      .locator(this.locators.communityDetailPage.leaveCommunityMessage)
      .isVisible();
  }

  async isMemberPresent(email: string): Promise<boolean> {
    return (
      (await this.page
        .locator(this.locators.communityDetailPage.memberRowByEmail(email))
        .count()) > 0
    );
  }

  async removeMemberByEmail(email: string): Promise<void> {
    const row = this.page.locator(
      this.locators.communityDetailPage.memberRowByEmail(email)
    );
    if ((await row.count()) === 0) return;

    const removeBtn = this.page.locator(
      this.locators.communityDetailPage.memberRemoveButtonInRow(email)
    );
    await removeBtn.click();

    const confirm = this.page.locator(
      this.locators.communityDetailPage.removeConfirmButton
    );
    await confirm.waitFor({ state: "visible", timeout: 15000 });
    await confirm.click();
    await this.page.waitForLoadState("networkidle");
  }

  async setMemberRole(
    email: string,
    role: "Reader" | "Curator" | "Manager" | "Owner"
  ): Promise<void> {
    const dropdown = this.page.locator(
      this.locators.communityDetailPage.memberRoleDropdownInRow(email)
    );
    await dropdown.waitFor({ state: "visible", timeout: 15000 });
    await dropdown.click();

    const option = this.page.locator(
      this.locators.communityDetailPage.memberRoleOption(role)
    );
    await option.waitFor({ state: "visible", timeout: 15000 });
    await option.click();

    await this.page.waitForLoadState("networkidle");
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

  // ACTIONS -----------------------------------------------------------

  async acceptAndPublishFirstRequest(): Promise<void> {
    await this.page.click(this.locators.communityDetailPage.acceptAndPublishButton);
    await this.page
      .locator(this.locators.communityDetailPage.acceptAndPublishConfirmButton)
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  async selectSubmissionReviewPolicyByIndex(index: number): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.submissionReviewPolicyRadio(index))
      .click();
  }

  async setMyMemberVisibility(visibility: "Public" | "Hidden"): Promise<void> {
    const dropdown = this.page.locator(
      this.locators.communityDetailPage.myVisibilityDropdown
    );
    await dropdown.waitFor({ state: "visible", timeout: 15000 });
    await dropdown.click();
    await this.page.getByRole("option", { name: visibility }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async isCurrentUserListed(): Promise<boolean> {
    return (
      (await this.page
        .locator(this.locators.communityDetailPage.memberListRowWithYouLabel)
        .count()) > 0
    );
  }

  async toggleFilterCheckbox(label: string): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.filterCheckbox(label))
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  async toggleViewAllVersions(): Promise<void> {
    await this.page
      .locator(this.locators.communityDetailPage.viewAllVersionsSlider)
      .click();
    await this.page.waitForLoadState("networkidle");
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

  async hasMemberRole(email: string, role: string): Promise<boolean> {
    const row = this.page.locator(
      this.locators.communityDetailPage.memberRowByEmail(email)
    );
    const txt = (await row.textContent()) ?? "";
    return txt.includes(role);
  }

  async hasAnyClosedRequest(): Promise<boolean> {
    return (
      (await this.page
        .locator(this.locators.communityDetailPage.closedRequestsResults)
        .count()) > 0
    );
  }

  async getCurationPolicyText(): Promise<string> {
    return (
      (
        await this.page
          .locator(this.locators.communityDetailPage.curationPolicyText)
          .textContent()
      )?.trim() ?? ""
    );
  }

  async getAboutText(): Promise<string> {
    return (
      (
        await this.page
          .locator(this.locators.communityDetailPage.aboutText)
          .textContent()
      )?.trim() ?? ""
    );
  }

  /**
   * Verifies that no records are visible in the community listing.
   * Used after logout when restricted records should not be listed.
   */
  async verifyRestrictedRecordNotPresent(): Promise<boolean> {
    const noMsg = this.page.locator(
      this.locators.communityDetailPage.communityNoRecordsMessage
    );
    if (await noMsg.isVisible().catch(() => false)) return true;

    const items = this.page.locator(
      this.locators.communityDetailPage.communityRecordsListItems
    );
    const count = await items.count();

    // If nothing is listed, consider it "not present"
    return count === 0;
  }
}
