import { expect, Download } from "@playwright/test";
import { Locators } from "../locators";
import { BasePage } from "./basePage";
//import { testData } from "../data/testData";

/**
 * Class representing the Record Detail page.
 */
export class RecordDetailPage<
  T extends Locators = Locators
> extends BasePage<T> {
  public uploadedTitle: string;

  constructor(page) {
    super(page);
//    this.uploadedTitle = testData.upload.recordTitle();
  }

  // NAVIGATION --------------------------------------------------------

  async navigateToHome() {
    await this.page.goto("/");
  }

  async navigateToMyDashboard() {
    await this.page.goto("/me");
  }

  // FIELDS ------------------------------------------------------------

  async getRecordTitle(): Promise<string> {
    const title = await this.page
      .locator(this.locators.recordDetailPage.recordTitle)
      .textContent();
    return title?.trim() ?? "";
  }

  async getCitationText(): Promise<string> {
    return (
      (
        await this.page
          .locator(this.locators.recordDetailPage.citationText)
          .textContent()
      )?.trim() ?? ""
    );
  }

  // BUTTONS -----------------------------------------------------------

  async clickEditButton() {
    const btn = this.page.locator(this.locators.recordDetailPage.editButton);
    await btn.waitFor({ state: "visible" });
    if (await btn.isEnabled()) await btn.click();
  }

  async clickNewVersionButton() {
    const btn = this.page.locator(
      this.locators.recordDetailPage.newVersionButton
    );
    await btn.waitFor({ state: "visible" });
    if (await btn.isEnabled()) await btn.click();
  }

  async clickShareButton() {
    await this.page.click(this.locators.recordDetailPage.shareButton);
  }

  async clickExportSelection() {
    await this.page.click(this.locators.recordDetailPage.exportSelectionButton);
  }

  async downloadExport(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download");

    const btn = this.page.getByRole(
      this.locators.recordDetailPage.exportButton.role as "button",
      { name: this.locators.recordDetailPage.exportButton.name }
    );

    await btn.waitFor({ state: "visible" });
    await btn.click();

    return downloadPromise;
  }

  async clickDownloadAll() {
    await this.page.click(this.locators.recordDetailPage.downloadAllButton);
  }

  async clickPreviewFile() {
    await this.page.click(this.locators.recordDetailPage.previewButton);
  }

  async clickDownloadFile() {
    await this.page.click(this.locators.recordDetailPage.downloadButton);
  }

  async selectCitationStyle(style: string) {
    await this.page.click(this.locators.recordDetailPage.citationDropdown);
    await this.page.click(
      this.locators.recordDetailPage.citationDropdownOption(style)
    );
    await this.page.waitForSelector(
      this.locators.recordDetailPage.citationDropdownSelected(style)
    );
  }

  async selectFileFormat(style: string) {
    await this.page.click(this.locators.recordDetailPage.exportDropdown);
    await this.page
      .locator(this.locators.recordDetailPage.exportDropdownExpanded)
      .waitFor({ state: "visible" });
    await this.page.click(
      this.locators.recordDetailPage.exportDropdownOption(style)
    );
  }

  // VERIFICATION ------------------------------------------------------

  async verifyVersionV2Present() {
    await expect(
      this.page.locator(this.locators.recordDetailPage.versionV2Item)
    ).toBeVisible();
  }

  async verifyVersionV1Present() {
    await expect(
      this.page.locator(this.locators.recordDetailPage.versionV1Label)
    ).toBeVisible();
  }

  async verifyEmbargoedLabel() {
    await expect(
      this.page.locator(this.locators.recordDetailPage.embargoedLabel)
    ).toBeVisible();
  }

  async verifyRestrictedLabel(timeout: number = 10000) {
    await expect(
      this.page.locator(this.locators.recordDetailPage.restrictedLabel)
    ).toBeVisible({ timeout });
  }

  async verifyPreviewContainerVisible() {
    await expect(
      this.page.locator(this.locators.recordDetailPage.previewContainer)
    ).toBeVisible();
  }

  async verifyPreviewIframeVisible() {
    await expect(
      this.page.locator(this.locators.recordDetailPage.previewIframe)
    ).toBeVisible();
  }

  async getSelectedCitationStyle(): Promise<string> {
    return await this.page
      .locator(this.locators.recordDetailPage.citationSelectedStyle)
      .innerText();
  }

  validateCitationFormat(citation: string, regex: RegExp): boolean {
    return regex.test(citation);
  }
}
