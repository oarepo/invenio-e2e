import { BasePage } from "./basePage";
import { Locators } from "../locators";

/**
 * Represents the Record Detail (Landing) page.
 * Provides navigation, actions (edit/new version/export/share), and verifications
 * for versions, access-status labels, citation section, and file preview UI.
 */
export class RecordDetailPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION --------------------------------------------------------------------------

  /**
   * Navigates to Version v1 from the Versions section.
   */
  async clickVersionV1(): Promise<void> {
    const link = this.page.locator(this.locators.recordDetailPage.versionV1Link);
    await link.waitFor({ state: "visible", timeout: 10000 });
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  // FIELDS ------------------------------------------------------------------------------

  /**
   * Returns the record title text.
   * @returns Record title as a trimmed string.
   */
  async getRecordTitle(): Promise<string> {
    const title = this.page.locator(this.locators.recordDetailPage.recordTitle);
    await title.waitFor({ state: "visible", timeout: 10000 });

    const text = await title.textContent();
    if (!text) throw new Error("Record title element is empty or not found.");
    return text.trim();
  }

  /**
   * Returns the citation text from the Citation section.
   * @returns Citation text as a trimmed string (empty if missing).
   */
  async getCitationText(): Promise<string> {
    const locator = this.page.locator(this.locators.recordDetailPage.citationText);
    const text = await locator.first().textContent();
    return text?.trim() ?? "";
  }

  /**
   * Returns currently selected citation style label (Citation dropdown).
   * @returns Selected style label.
   */
  async getSelectedStyle(): Promise<string> {
    const locator = this.page.locator(this.locators.recordDetailPage.citationSelectedStyle);
    await locator.waitFor({ state: "visible", timeout: 10000 });
    return (await locator.innerText()).trim();
  }

  // BUTTONS -----------------------------------------------------------------------------

  /**
   * Clicks the "Edit" button on the record management panel.
   */
  async clickEdit(): Promise<void> {
    const btn = this.page.locator(this.locators.recordDetailPage.editButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Clicks the "New version" button on the record management panel.
   */
  async clickNewVersion(): Promise<void> {
    const btn = this.page.locator(this.locators.recordDetailPage.newVersionButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Clicks the "Share" button on the record management panel.
   */
  async clickShare(): Promise<void> {
    const btn = this.page.locator(this.locators.recordDetailPage.shareButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
  }

  /**
   * Opens the "Export selection" dropdown (Export section).
   */
  async clickExportSelection(): Promise<void> {
    const dropdown = this.page.locator(this.locators.recordDetailPage.exportSelectionDropdown);
    await dropdown.waitFor({ state: "visible", timeout: 10000 });
    await dropdown.click();
  }

  /**
   * Selects a file format in Export selection dropdown.
   * @param format Option label (e.g. "JSON", "JSON-LD", "DCAT", "DataCite JSON").
   */
  async selectFileFormat(format: string): Promise<void> {
    await this.clickExportSelection();

    const option = this.page.locator(this.locators.recordDetailPage.exportFormatOption(format));
    await option.waitFor({ state: "visible", timeout: 10000 });
    await option.click();
  }

  /**
   * Clicks "Export" button and returns a Playwright download promise.
   */
  async clickExportButton() {
    const btn = this.page.locator(this.locators.recordDetailPage.exportButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });

    const downloadPromise = this.page.waitForEvent("download");
    await btn.click();

    return downloadPromise;
  }

  /**
   * Clicks the "Download all" button (archive link).
   */
  async clickDownloadAll(): Promise<void> {
    const btn = this.page.locator(this.locators.recordDetailPage.downloadAllButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
  }

  /**
   * Clicks "Preview" button for the file preview (if present).
   */
  async clickPreview(): Promise<void> {
    const btn = this.page.locator(this.locators.recordDetailPage.previewButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
  }

  /**
   * Clicks "Download" button for a file (if present).
   */
  async clickDownload(): Promise<void> {
    const btn = this.page.locator(this.locators.recordDetailPage.downloadButton);
    await btn.waitFor({ state: "visible", timeout: 10000 });
    await btn.click();
  }

  /**
   * Selects citation style in Citation dropdown.
   * @param style Citation style label (e.g. "Harvard", "APA", "IEEE").
   */
  async selectCitationStyle(style: string): Promise<void> {
    const dropdown = this.page.locator(".ui.selection.dropdown.citation-dropdown");
    await dropdown.waitFor({ state: "visible", timeout: 10000 });
    await dropdown.click();

    const option = this.page.locator(this.locators.recordDetailPage.citationStyleOption(style));
    await option.waitFor({ state: "visible", timeout: 10000 });
    await option.click();

    // Verify selection is shown
    const selected = this.page.locator(this.locators.recordDetailPage.citationSelectedStyle);
    await this.expect(selected).toHaveText(new RegExp(`^${style}$`));
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Checks whether Version v2 item is present (active) in the Versions section.
   * @returns True if Version v2 is present, otherwise false.
   */
  async isVersionV2Present(): Promise<boolean> {
    const locator = this.page.locator(this.locators.recordDetailPage.versionV2ActiveLabel);
    return (await locator.count()) > 0;
  }

  /**
   * Checks whether the Version v1 label is present on the Version v1 landing page.
   * @returns True if Version v1 label is present, otherwise false.
   */
  async isVersionV1Present(): Promise<boolean> {
    const locator = this.page.locator(this.locators.recordDetailPage.versionV1HeaderLabel);
    return (await locator.count()) > 0;
  }

  /**
   * Checks whether Embargoed label is visible.
   */
  async isEmbargoedLabelPresent(): Promise<boolean> {
    return await this.page.locator(this.locators.recordDetailPage.embargoedLabel).isVisible();
  }

  /**
   * Checks whether Embargoed status section is visible.
   */
  async isEmbargoedStatusSectionPresent(): Promise<boolean> {
    return await this.page
      .locator(this.locators.recordDetailPage.embargoedStatusSection)
      .isVisible();
  }

  /**
   * Checks whether Restricted label is visible within a timeout.
   * @param timeoutMs Timeout in ms (default 10s).
   */
  async isRestrictedLabelPresent(timeoutMs: number = 10000): Promise<boolean> {
    const locator = this.page.locator(this.locators.recordDetailPage.restrictedLabel);
    try {
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks whether record access status section is visible.
   */
  async isRecordAccessStatusSectionPresent(): Promise<boolean> {
    const locator = this.page.locator(this.locators.recordDetailPage.recordAccessStatusSection);
    try {
      await locator.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks whether the restricted files message is visible within a timeout.
   * @param timeoutMs Timeout in ms (default 10s).
   */
  async checkRestrictedMessagePresence(timeoutMs: number = 10000): Promise<boolean> {
    const locator = this.page.locator(this.locators.recordDetailPage.restrictedFilesMessage);
    try {
      await locator.waitFor({ state: "visible", timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks whether the preview container (accordion panel) is visible.
   */
  async isPreviewContainerVisible(): Promise<boolean> {
    return await this.page.locator(this.locators.recordDetailPage.filesPreviewContainer).isVisible();
  }

  /**
   * Checks whether the preview iframe exists inside the preview container.
   */
  async isPreviewIframeInsideContainer(): Promise<boolean> {
    return await this.page.locator(this.locators.recordDetailPage.filesPreviewIframe).isVisible();
  }

  /**
   * Validates citation format using a provided RegExp.
   * @param citation Citation string to validate.
   * @param regex Regular expression to validate against.
   */
  validateCitationFormat(citation: string, regex: RegExp): boolean {
    return regex.test(citation);
  }
}