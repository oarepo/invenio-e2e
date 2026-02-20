import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { PreviewPage } from "./previewPage";
import { expect, Locator } from "@playwright/test";
import { ExpectedTexts } from "../locators/expectedTexts";
import { getCurrentDateFormatted } from "../fixtures/utils";
import { ExpectedError as ErrorWithLocation } from "../services/form";
import path from "path";
import { appConfig } from "../config";

/**
 * Represents the Deposit page in the application.
 * Provides methods to interact with fields, buttons, and verify system messages.
 */

export class DepositPage<T extends Locators = Locators> extends BasePage<T> {
  
  // NAVIGATION ------------------------------------------------------------------------

  /**
   * Opens the Deposit page and validates that it has loaded.
   */
  async openPage(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
    await this.validatePageLoaded();
  }

  /**
   * Opens the "Select a community" modal.
   */
  async openCommunitySelector(): Promise<void> {
    const btn = this.page.locator(this.locators.uploadPage.communitySelectButton);
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await btn.click();
  }

  /**
   * Switches to "My communities" tab inside the community selector.
   */
  async selectMyCommunitiesTab(): Promise<void> {
    const tab = this.page.locator(this.locators.uploadPage.myCommunitiesTab);
    await tab.waitFor({ state: "visible", timeout: 15000 });
    await tab.click();
  }

  /**
   * Selects a community by name in the modal table.
   */
  async selectCommunityByName(name: string): Promise<void> {
    const btn = this.page.locator(
      this.locators.uploadPage.communitySelectRowButton(name)
    );
    await btn.waitFor({ state: "visible", timeout: 15000 });
    await btn.click();
  }

  /**
   * Submits the record for community review and confirms required checkboxes.
   */
  async submitForReview(): Promise<void> {
    const submit = this.page.locator(this.locators.uploadPage.submitForReviewButton);
    await submit.waitFor({ state: "visible", timeout: 15000 });
    await submit.click();

    // Check confirmation checkboxes if present
    const accessCb = this.page.locator(
      this.locators.uploadPage.acceptAccessToRecordCheckbox
    );
    const publishCb = this.page.locator(
      this.locators.uploadPage.acceptPublishRecordCheckbox
    );

    if (await accessCb.isVisible().catch(() => false))
      await accessCb.check({ force: true });
    if (await publishCb.isVisible().catch(() => false))
      await publishCb.check({ force: true });

    const confirm = this.page.locator(
      this.locators.uploadPage.submitForReviewConfirmButton
    );
    await confirm.waitFor({ state: "visible", timeout: 15000 });
    await confirm.click();
  }

  /**
   * Verifies the "Submitted" status label is visible on the record page.
   */
  async isSubmittedStatusVisible(): Promise<boolean> {
    return await this.page
      .locator(this.locators.uploadPage.submittedStatusLabel)
      .isVisible();
  }

  // VALIDATION -------------------------------------------------------------------------

  /**
   * Validates that the Deposit page has loaded successfully.
   */
  async validatePageLoaded(): Promise<void> {
    await super.validatePageLoaded();
  }

  // FIELDS ------------------------------------------------------------------------------

  /**
   * Fills the Title field.
   * @param title Title text to enter.
   */
  async fillTitle(title: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.titleField).fill(title);
  }

  /**
   * Fills the Description field.
   * @param description Description text to enter.
   */
  async fillDescription(description: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.descriptionField)
      .fill(description);
  }

  /**
   * Toggles the "Metadata-only record" checkbox.
   * @param checked True to check, false to uncheck.
   */
  async fillMetadataOnly(checked: boolean): Promise<void> {
    const checkbox = this.page.locator(this.locators.uploadPage.metadataOnlyCheckbox);

    const isChecked = await checkbox.locator('input[type="checkbox"]').isChecked();

    if (isChecked !== checked) {
      await checkbox.click();
    }
    await this.page.waitForTimeout(100);
  }

  /**
   * Upload a specific file from the UploadFiles folder.
   * @param filename Name of the file to upload
   */
  async uploadFile(filename: string) {
    const filePath = path.join(
      __dirname,
      "..",
      appConfig.dataFolderPath,
      "UploadFiles",
      filename
    );
    await this.page.setInputFiles('input[type="file"]', filePath);
    console.log(`[BasePage] Uploading file: ${filePath}`);
  }

  /**
   * Upload a file and confirm by clicking the "Upload" button in Uppy.
   * @param filename Name of the file to upload
   */
  async uploadFileAndConfirm(filename: string) {
    await this.uploadFile(filename);

    const uploadBtn = this.page.locator(this.locators.uploadPage.uploadFilesButton);
    await expect(uploadBtn).toBeEnabled({ timeout: 10000 });

    await uploadBtn.click();

    const uploaded = this.page.locator(this.locators.uploadPage.uploadedFile(filename));

    await expect(uploaded).toBeVisible({ timeout: 15000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));

    console.log(`[DepositPage] Uploaded and confirmed file: ${filename}`);
  }

  /**
   * Selects a Resource Type from the dropdown.
   * @param optionLabel Label of the resource type to select.
   */
  async selectResourceType(optionLabel: string): Promise<void> {
    const dropdown = this.page.locator(this.locators.uploadPage.resourceTypeDropdown);
    await dropdown.click();

    // Locate the exact option by text
    const option = dropdown.locator(".item .text", {
      hasText: new RegExp(`^${optionLabel}$`),
    });

    if ((await option.count()) === 0) {
      throw new Error(`Resource type "${optionLabel}" not found in dropdown`);
    }

    await option.first().click();
  }

  /**
   * Fills the publication date field. Uses the current date if none is provided.
   * @param date Optional date to enter.
   */
  async fillPublicationDate(date?: string): Promise<void> {
    const dateToUse = date ?? getCurrentDateFormatted();
    await this.page
      .locator(this.locators.uploadPage.publicationDateField)
      .fill(dateToUse);
  }

  /**
   * Fills the creator’s family name in the Add Creator dialog.
   * @param name Family name to enter.
   */
  async fillCreatorFamilyName(name: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.familyNameField).fill(name);
  }

  /**
   * Fills the creator’s given name in the Add Creator dialog.
   * @param name Given name to enter.
   */
  async fillCreatorGivenName(name: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.givenNameField).fill(name);
  }

  /**
   * Sets the access level for files (files-only access).
   */
  async setFilesOnlyAccess(level: "Restricted" | "Public"): Promise<void> {
    const dropdown = this.page.locator(this.locators.uploadPage.filesAccessDropdown);
    await dropdown.waitFor({ state: "visible", timeout: 15000 });
    await dropdown.click();

    const option = this.page.locator(".visible.menu .item", { hasText: level });
    await option.waitFor({ state: "visible", timeout: 10000 });
    await option.click();

    await this.page.waitForLoadState("networkidle");
  }

  /*
  // Upload a random file using the FileUploadHelper
  async uploadFile(filename: string): Promise<void> {
    const helper = new FileUploadHelper(this.page);
    await helper.uploadRandomFileAndConfirm();
  }
    */

  // BUTTONS -----------------------------------------------------------------------------

  /**
   * Clicks the Browse Files link.
   */
  async clickBrowseFiles(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.browseFilesButton).click();
  }

  /**
   * Clicks the Add Creator button.
   */
  async clickAddCreatorButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.addCreatorButton).click();
  }

  /**
   * Clicks the Save button in the Add Creator dialog.
   */
  async clickAddCreatorSaveButton(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.saveAddCreatorButton)
      .nth(1)
      .click();
  }

  /**
   * Clicks the Preview button and returns a new PreviewPage instance.
   * @returns Instance of the PreviewPage.
   */
  async clickPreview(): Promise<PreviewPage> {
    await this.page.locator(this.locators.uploadPage.previewButton).click();
    await this.page.waitForLoadState("networkidle");
    const previewPage = this.availablePages.previewPage;
    // Ensure the preview page is fully loaded before returning
    await previewPage.validatePageLoaded();
    return previewPage;
  }

  /**
   * Clicks the Save Draft button.
   */
  async clickSave(): Promise<void> {
    const saveDraftButton = this.page.locator(this.locators.uploadPage.saveDraftButton);
    await saveDraftButton.click();
    // this makes the API call that can take some time on server so that network idle is not enough
    await this.page.waitForLoadState("networkidle");
    await expect(saveDraftButton).not.toHaveClass(/loading/);
    // Scroll to top to see the error message if there is any
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Clicks the Publish button.
   */
  async clickPublish(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.publishButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Confirms record publication in the confirmation dialog.
   */
  async confirmPublication(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.publishButton).nth(1).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Clicks the Edit button.
   */
  async clickEditButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.editButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Clicks the Delete button.
   */
  async clickDeleteButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.deleteButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Confirms record deletion.
   */
  async confirmDeletion(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.confirmDeleteButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Verifies that a toast message with the expected text is visible.
   * @param expectedText Expected text to appear in the toast message.
   */
  private async verifyToastMessage(expectedText: string): Promise<void> {
    const toast = this.page.locator(
      this.locators.uploadPage.toastMessage(expectedText)
    );
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText(new RegExp(expectedText, "i"));
  }

  /**
   * Verifies that the Save Draft message appears.
   */
  async verifySaveDraftMessage(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.draftSaved);
  }

  /**
   * Verifies that the Record Published message appears.
   */
  async verifySuccessfulPublishMessage(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.recordPublished);
  }

  /**
   * Verifies that the Record Deleted message appears.
   */
  async verifyRecordWasDeleted(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.recordDeleted);
  }

  /**
   * Verifies that a specific title is visible on the page.
   * @param title Title text to verify.
   */
  async verifyTitleIsVisible(title: string): Promise<void> {
    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  /**
   * Verifies that the displayed error messages match the expected ones.
   * @param expectedErrors Array of expected errors, each containing a message and optional field.
   * @param onlyThese If true (default), verifies that only the expected messages are present.
   */
  async verifyErrorMessages(
    expectedErrors: ErrorWithLocation[],
    onlyThese: boolean = true
  ): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    /* field looks like: 
        <div>
          <something name="field_name"></>
          <div class="ui pointing above prompt label">error message</>
        </div>
    */
    const errorFieldsLocator = this.page.locator(
      this.locators.uploadPage.fieldWithError
    );
    // let's extract the field name and the error message
    const foundErrors: string[][] = [];
    const count = await errorFieldsLocator.count();
    for (let i = 0; i < count; i++) {
      const { fieldName, errorMessage } = await this._getErrorFieldAndMessage(
        errorFieldsLocator.nth(i)
      );
      if (fieldName && errorMessage) {
        foundErrors.push([fieldName, errorMessage]);
      }
    }

    if (expectedErrors.length === 0 && onlyThese) {
      // verify that no error messages are shown
      if (foundErrors.length > 0) {
        throw new Error(
          `Expected no error messages, but found: ${foundErrors
            .map(([f, m]) => `[${f}] ${m}`)
            .join(", ")}`
        );
      }
      return;
    }

    // now let's match expected erorrs with the actual ones. If we match an error,
    // we will remove it from the "errorMessages" array so that at the end we can see
    // if there are any unmatched errors
    const { unmatchedErrors, unmatchedErrorMessages } = this._matchErrorMessages(
      expectedErrors,
      foundErrors
    );

    if (unmatchedErrors.length > 0) {
      throw new Error(
        `Expected error messages not found: ${unmatchedErrors
          .map((e) => (e.field ? `[${e.field}] ${e.message}` : e.message.toString()))
          .join(", ")}`
      );
    }

    if (onlyThese && unmatchedErrorMessages.length > 0) {
      throw new Error(
        `Unexpected error messages found: ${unmatchedErrorMessages
          .map((e) => `[${e[0]}] ${e[1]}`)
          .join(", ")}`
      );
    }
  }

  /**
   * Matches expected errors with actual errors found on the page.
   * @param messages Array of expected error messages.
   * @param errorMessages Array of actual [fieldName, errorMessage] pairs.
   * @returns Object containing unmatched expected and actual error messages.
   */
  private _matchErrorMessages(
    messages: ErrorWithLocation[],
    errorMessages: string[][]
  ) {
    // make copy of the error messages
    errorMessages = errorMessages.slice();
    const unmatchedErrors: ErrorWithLocation[] = [];
    for (const expectedError of messages) {
      const { message, field } = expectedError;
      let matched = false;
      for (let i = 0; i < errorMessages.length; i++) {
        const [fieldName, errorMessage] = errorMessages[i];
        const fieldMatches = field ? field === fieldName : true;
        const messageMatches =
          typeof message === "string"
            ? message.trim() === errorMessage.trim()
            : message instanceof RegExp
              ? message.test(errorMessage.trim())
              : false;
        if (fieldMatches && messageMatches) {
          // matched, remove from the list
          errorMessages.splice(i, 1);
          matched = true;
          break;
        }
      }
      if (!matched) {
        unmatchedErrors.push(expectedError);
      }
    }
    return { unmatchedErrors, unmatchedErrorMessages: errorMessages };
  }

  /**
   * Extracts the field name and error message from a given field locator.
   * @param field Locator of a field with an error.
   * @returns Object containing the field name (if available) and the error message.
   */
  private async _getErrorFieldAndMessage(field: Locator) {
    const errorMessage = await field
      .locator(this.locators.uploadPage.errorMessageInsideField)
      .innerText({ timeout: 100 });

    try {
      return {
        errorMessage,
        fieldName: await field.locator("label[for]").first().getAttribute("for"),
      };
    } catch {
      // ignore
    }
    try {
      return {
        errorMessage,
        fieldName: await field
          .locator("input[name], textarea[name], select[name]")
          .first()
          .getAttribute("name"),
      };
    } catch {
      // ignore
    }
    return { errorMessage };
  }

  // FLOWS -------------------------------------------------------------------------------

  /**
   * Adds a new creator with given details.
   * @param data Object containing the creator details.
   * @param data.givenName Optional given name of the creator.
   * @param data.familyName Optional family name of the creator.
   */
  async addCreator(data: { givenName?: string; familyName?: string }) {
    await this.clickAddCreatorButton();
    if (data.familyName) {
      await this.fillCreatorFamilyName(data.familyName);
    }
    if (data.givenName) {
      await this.fillCreatorGivenName(data.givenName);
    }
    await this.clickAddCreatorSaveButton();
  }

  /**
   * Sets the record access level for the whole record (e.g. Restricted / Public).
   * This is the "Full record" access option (not files-only).
   */
  async setFullRecordAccess(level: "Restricted" | "Public"): Promise<void> {
    const dropdown = this.page.locator(
      this.locators.uploadPage.fullRecordAccessDropdown
    );
    await dropdown.waitFor({ state: "visible" });
    await dropdown.click();

    const option = this.page.getByRole("option", { name: level });
    await option.waitFor({ state: "visible" });
    await option.click();

    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Toggles "Apply an embargo" option.
   */
  async enableEmbargo(enabled: boolean): Promise<void> {
    const checkbox = this.page.locator(this.locators.uploadPage.embargoCheckbox);
    await checkbox.waitFor({ state: "visible" });

    const input = checkbox.locator('input[type="checkbox"]');
    const isChecked = await input.isChecked();

    if (isChecked !== enabled) {
      await checkbox.click();
    }
  }

  /**
   * Fills "Embargo until" with a relative date (e.g. +7 days).
   */
  async setEmbargoUntilDateRelative(offset: { days: number }): Promise<void> {
    const field = this.page.locator(this.locators.uploadPage.embargoUntilField);
    await field.waitFor({ state: "visible" });

    const date = new Date();
    date.setDate(date.getDate() + offset.days);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    // Adjust formatting if your UI expects different format
    await field.fill(`${yyyy}-${mm}-${dd}`);
  }

  /**
   * Fills "Embargo reason".
   */
  async fillEmbargoReason(text: string): Promise<void> {
    const field = this.page.locator(this.locators.uploadPage.embargoReasonField);
    await field.waitFor({ state: "visible" });
    await field.fill(text);
  }

  async hasValidationErrors(): Promise<boolean> {
    return (
      (await this.page
        .locator("div.ui.error.message, .ui.pointing.red.basic.label")
        .count()) > 0
    );
  }

  async confirmPublicationIfPresent(): Promise<void> {
    const confirmBtn = this.page.locator(
      'button.ui.primary.button:has-text("Publish")'
    );
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click();
      await this.page.waitForLoadState("networkidle");
    }
  }

  async deleteRecord(): Promise<void> {
    const deleteBtn = this.page.locator('button.ui.negative.button:has-text("Delete")');
    await deleteBtn.waitFor({ state: "visible", timeout: 15000 });
    await deleteBtn.click();

    const confirm = this.page.locator('button.ui.negative.button:has-text("Delete")');
    await confirm.waitFor({ state: "visible", timeout: 15000 });
    await confirm.click();

    await this.page.waitForLoadState("networkidle");
  }

  // WAITS --------------------------------------------------------------------------------

  /**
   * Waits until the upload of a given file is completed.
   * @param fileName Name of the file to wait for.
   * @throws Will throw an error if the upload does not complete within 20 seconds.
   */
  async waitForUploadComplete(fileName: string): Promise<void> {
    await this.page.waitForSelector(this.locators.uploadPage.uploadCompleteBar(), {
      state: "visible",
      timeout: 20000,
    });
    console.log(`Upload complete for file: ${fileName}`);
  }

  /**
   * async fillAndSubmit(data: Record&lt;string, any>): Promise&lt;DepositPage> {
   *
   * }
   */
}
