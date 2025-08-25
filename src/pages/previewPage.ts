import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { expect } from "@playwright/test";

/**
 * Class representing a preview / record detail page.
 */
export class PreviewPage<T extends Locators = Locators> extends BasePage<T> {
  // VALIDATION ------------------------------------------------------------------------

  /**
   * Validates that the preview page has fully loaded.
   */
  async validatePageLoaded(): Promise<void> {
    await super.validatePageLoaded();
    // check that the record title element is visible - these checks can be extended
    await expect(
      this.page.locator(this.locators.uploadPage.recordTitleHeader)
    ).toBeVisible();
  }

  // VERIFICATIONS ---------------------------------------------------------------------

  /**
   * Verifies the informational message shown when a draft is being previewed.
   */
  async verifySaveDraftPreview(): Promise<void> {
    const successMessage = this.page.locator(
      this.locators.previewPage.saveDraftInfoMessage
    );
    await expect(successMessage).toHaveText(
      "Preview You are previewing a new record that has not yet been published."
    );
  }

  /**
   * Verifies the informational message shown when only published versions are displayed.
   */
  async verifySaveDraftPreviewVersions(): Promise<void> {
    const successMessage = this.page.locator(
      this.locators.previewPage.saveDraftVersionsInfoMessage
    );
    await expect(successMessage).toHaveText(
      "PreviewOnly published versions are displayed."
    );
  }

  /**
   * Checks if a record with the given title exists on the page.
   * @param expectedTitle The title to verify.
   * @returns True if the title matches, false otherwise.
   */
  async checkRecordExists(expectedTitle: string): Promise<boolean> {
    const titleLocator = this.page.locator(
      this.locators.uploadPage.recordTitleHeader
    );

    // Wait until the record title becomes visible
    await titleLocator.waitFor({ state: "visible", timeout: 10000 });
    const titleText = (await titleLocator.textContent())?.trim();

    if (titleText === expectedTitle.trim()) {
      console.log(`Record with title "${expectedTitle}" exists.`);
      return true;
    } else {
      console.error(
        `Expected title "${expectedTitle}", but found "${titleText}".`
      );
      return false;
    }
  }

  // GETTERS ---------------------------------------------------------------------------

  async getRecordDescription(): Promise<string> {
    return await this.page
      .locator(this.locators.previewPage.recordDescription)
      .innerText();
  }

  async getRecordTitle(): Promise<string> {
    return await this.page
      .locator(this.locators.uploadPage.recordTitleHeader)
      .innerText();
  }

  /**
   * Counts the number of uploaded files displayed in the preview page.
   * @returns Number of uploaded files.
   */
  async countUploadedFiles(): Promise<number> {
    const rows = this.page.locator(this.locators.previewPage.uploadedFilesRows);
    const count = await rows.count();
    console.log(`Number of uploaded files: ${count}`);
    return count;
  }

  /**
   * Waits until at least one uploaded file row is visible in the table.
   * Ensures that the uploaded files table has rendered.
   */
  async waitForUploadedFilesTable(): Promise<void> {
    await this.page
      .locator(this.locators.previewPage.uploadedFilesRows)
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
  }
}
