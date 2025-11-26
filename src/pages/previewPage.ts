import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { expect } from "@playwright/test";

/**
 * Class representing a preview / record detail page.
 * Provides methods for verifying record details, uploaded files, metadata, and creator information.
 */

export class PreviewPage<T extends Locators = Locators> extends BasePage<T> {
  // VALIDATION ------------------------------------------------------------------------

  /**
   * Validates that the preview page has fully loaded by checking the record title element.
   */
  async validatePageLoaded(): Promise<void> {
    await super.validatePageLoaded();
    // check that the record title element is visible - these checks can be extended
    await expect(this.page.locator(this.locators.uploadPage.recordTitleHeader)).toBeVisible();
  }

  // VERIFICATIONS ---------------------------------------------------------------------

  /**
   * Verifies the informational message shown when a draft is being previewed.
   */
  async verifySaveDraftPreview(): Promise<void> {
    const successMessage = this.page.locator(this.locators.previewPage.saveDraftInfoMessage);
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
    await expect(successMessage).toHaveText("PreviewOnly published versions are displayed.");
  }

  /**
   * Verifies that an uploaded file with the given filename is visible in the preview page.
   * @param filename The expected filename of the uploaded file.
   */
  async verifyUploadedFile(filename: string): Promise<void> {
    await this.waitForUploadedFilesTable();

    const uploaded = this.page.locator(this.locators.uploadPage.uploadedFile(filename));

    await expect(uploaded).toBeVisible({ timeout: 10000 });
    console.log(`Verified uploaded file is visible: ${filename}`);
  }

  /**
   * Verifies that the creator matches the expected value.
   * @param expected Expected creator name or object with name property.
   */
  async verifyCreator(expected: string | { name: string }): Promise<void> {
    const creatorLocator = this.page.locator(this.locators.previewPage.creator);
    await creatorLocator.first().waitFor({ state: "visible", timeout: 10000 });

    const actualValue = (await creatorLocator.first().textContent())?.trim();
    const expectedValue = typeof expected === "string" ? expected : expected.name;

    if (actualValue !== expectedValue) {
      throw new Error(`Expected Creator "${expectedValue}", but found "${actualValue}"`);
    }

    console.log(`Verified Creator: ${actualValue}`);
  }

  /**
   * Verifies that the record title on the page matches the expected title.
   * Fails the test if the title does not match.
   * @param expectedTitle The title string that should appear on the page.
   */
  async verifyTitle(expectedTitle: string): Promise<void> {
    const titleLocator = this.page.locator(this.locators.uploadPage.recordTitleHeader);

    // Wait until the record title becomes visible
    await titleLocator.waitFor({ state: "visible", timeout: 10000 });

    const titleText = (await titleLocator.textContent())?.trim();

    if (titleText === expectedTitle.trim()) {
      console.log(`Record with title "${expectedTitle}" exists.`);
    } else {
      throw new Error(`Expected title "${expectedTitle}", but found "${titleText}".`);
    }
  }

  /**
   * Verifies that the resource type matches the expected value.
   * @param expectedValue Expected resource type text.
   */
  async verifyResourceType(expectedValue: string): Promise<void> {
    const locator = this.page.locator(this.locators.previewPage.resourceType);
    await locator.waitFor({ state: "visible", timeout: 10000 });
    const actualValue = (await locator.textContent())?.trim();
    if (actualValue !== expectedValue) {
      throw new Error(`Expected Resource type "${expectedValue}", but found "${actualValue}"`);
    } else {
      console.log(`Verified Resource type: ${actualValue}`);
    }
  }

  /**
   * Verifies that the description matches the expected value.
   * @param expectedValue Expected description text.
   */
  async verifyDescription(expectedValue: string): Promise<void> {
    const locator = this.page.locator(this.locators.previewPage.recordDescription);
    const actualValue = (await locator.textContent())?.trim();

    if (actualValue !== expectedValue) {
      throw new Error(`Expected description "${expectedValue}", but got "${actualValue}"`);
    }

    console.log(`Description verified: ${actualValue}`);
  }

  /**
   * Iterates over provided field-value pairs and calls the corresponding verification methods.
   * @param filledData Array of [field, value] pairs for verification.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async verifyData(filledData: any[][]): Promise<void> {
    for (const data of filledData) {
      console.log("verifyData got:", JSON.stringify(data)); // DEBUG

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [field, value] = data;
      if (!field) {
        throw new Error(`verifyData: expected [field, value], but got ${JSON.stringify(data)}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const methodName = `verify${field.charAt(0).toUpperCase() + field.slice(1)}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      if (typeof (this as any)[methodName] === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        await (this as any)[methodName](value);
      } else {
        throw new Error(`No verification method found for field ${field}`);
      }
    }
  }

  /**
   * Verifies that the record is marked as metadata-only.
   */
  async verifyMetadataOnly(): Promise<void> {
    const locator = this.page.locator(this.locators.previewPage.metadataOnlyLabel);
    await expect(locator).toBeVisible({ timeout: 5000 });
    console.log("Verified record is metadata-only");
  }

  // GETTERS ---------------------------------------------------------------------------

  /**
   * Gets the record description text.
   * @returns The description text of the record.
   */
  async getRecordDescription(): Promise<string> {
    return await this.page.locator(this.locators.previewPage.recordDescription).innerText();
  }

  /**
   * Gets the record title text.
   * @returns The title text of the record.
   */
  async getRecordTitle(): Promise<string> {
    return await this.page.locator(this.locators.uploadPage.recordTitleHeader).innerText();
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
   */
  async waitForUploadedFilesTable(): Promise<void> {
    await this.page
      .locator(this.locators.previewPage.uploadedFilesRows)
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
  }
}
