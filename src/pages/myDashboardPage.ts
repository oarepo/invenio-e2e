import { BasePage } from "./basePage";
import { Locators } from "../locators";

/**
 * Class representing the user Dashboard page.
 */

export class MyDashboardPage<T extends Locators = Locators> extends BasePage<T> {
    
  // NAVIGATION ------------------------------------------------------------------------

  /**
   * Navigate to the "Communities" section from the dashboard.
   */
  async navigateToCommunities() {
    await this.page
      .locator(this.locators.myDashboardPage.communitiesLink)
      .click();
    await this.page.waitForSelector(this.locators.communitiesPage.pageTitle, {
      state: "visible",
    });
  }

  /**
   * Navigate directly to the "My Dashboard" page.
   */
  async navigateToMyDashboard() {
    await this.page.goto("/me");
  }

  /**
   * Opens the detail of the first record in the dashboard.
   */
  async firstRecordDetail() {
    await this.page
      .locator(this.locators.myDashboardPage.firstRecordDetail)
      .click();
  }

  /**
   * Opens the first community card in the dashboard.
   */
  async navigateToFirstCommunity() {
    await this.page
      .locator(this.locators.myDashboardPage.firstCommunityCard)
      .click();
    await this.page.waitForSelector(this.locators.myDashboardPage.recordsTab, {
      state: "visible",
    });
  }

  /**
   * Navigate to the "Requests" section of the dashboard.
   */
  async navigateToRequests() {
    await this.page.locator(this.locators.myDashboardPage.requestsLink).click();
  }

  // BUTTONS ---------------------------------------------------------------------------

  /**
   * Clicks the edit button for the first record in the dashboard.
   */
  async clickEditButton() {
    await this.page
      .locator(this.locators.myDashboardPage.editFirstRecordButton)
      .click();
  }

  /**
   * Clicks the "Accept" button for a request at a given index.
   * @param index Index of the request (default 0).
   */
  async clickAcceptButton(index = 0) {
    await this.page
      .locator(this.locators.myDashboardPage.acceptButton(index))
      .click();
  }

  /**
   * Clicks the "Decline" button for a request at a given index.
   * @param index Index of the request (default 0).
   */
  async clickDeclineButton(index = 0) {
    await this.page
      .locator(this.locators.myDashboardPage.declineButton(index))
      .click();
  }

  /**
   * Checks if the "Decline" button is present for a request at a given index.
   * @param index Index of the request (default 0).
   * @returns True if present, false otherwise.
   */
  async isDeclineButtonPresent(index = 0): Promise<boolean> {
    return (
      (await this.page
        .locator(this.locators.myDashboardPage.declineButton(index))
        .count()) > 0
    );
  }

  /**
   * Confirms the accept action by clicking the confirmation button.
   */
  async clickAcceptButtonConfirm() {
    await this.page
      .locator(this.locators.myDashboardPage.acceptConfirmButton)
      .click();
  }

  /**
   * Confirms the decline action by clicking the confirmation button.
   */
  async clickDeclineButtonConfirm() {
    await this.page
      .locator(this.locators.myDashboardPage.declineConfirmButton)
      .click();
  }

  /**
   * Toggles the versions dropdown for a record.
   */
  async clickVersionsToggle() {
    await this.page
      .locator(this.locators.myDashboardPage.versionsToggle)
      .click();
  }

  // VERIFICATIONS -----------------------------------------------------------------------

  /**
   * Verifies that a record with the given title is absent from the dashboard.
   * @param recordTitle The title of the record to check.
   * @returns True if absent, false otherwise.
   */
  async verifyRecordIsAbsent(recordTitle: string): Promise<boolean> {
    return (await this.page.locator(`text=${recordTitle}`).count()) === 0;
  }

  /**
   * Checks if the "All Done" message is present on the dashboard.
   */
  async isAllDoneMessagePresent(): Promise<boolean> {
    return this.page
      .locator(this.locators.myDashboardPage.allDoneMessage)
      .isVisible();
  }

  /**
   * Checks if the "New Version Draft" label is present.
   * @returns True if present, false otherwise.
   */
  async isNewVersionDraftLabelPresent(): Promise<boolean> {
    try {
      await this.page.waitForSelector(
        this.locators.myDashboardPage.newVersionDraftLabel,
        { state: "visible", timeout: 5000 }
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a record title in the dashboard matches the given string.
   * @param title The expected record title.
   * @returns True if matching record is found, false otherwise.
   */
  async isRecordTitleMatching(title: string): Promise<boolean> {
    const recordTitleLocator = this.page.locator(
      this.locators.myDashboardPage.recordTitle(title)
    );
    return (await recordTitleLocator.count()) > 0;
  }
}
