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
 * Class representing a Deposit page in the application.
 * Contains methods to interact with fields, buttons, and perform verifications.
 */
export class DepositPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION ------------------------------------------------------------------------

  /*
   * Navigate to the Deposit page.
   */
  async openPage(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
    await this.validatePageLoaded();
  }

  // VALIDATION -------------------------------------------------------------------------

  /**
   * Validates that the deposit page has loaded.
   */
  async validatePageLoaded(): Promise<void> {
    await super.validatePageLoaded();
  }

  // FIELDS ------------------------------------------------------------------------------

  // Fill in the 'Title' field
  async fillTitle(title: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.titleField).fill(title);
  }

  // Fill in the 'Description' field
  async fillDescription(description: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.descriptionField)
      .fill(description);
  }

  /**
   * Clicks the "Metadata-only record" checkbox according to the given value.
   * @param checked Boolean value - true to check, false to uncheck.
   */
  async fillMetadataOnly(checked: boolean): Promise<void> {
    const checkbox = this.page.locator(
      this.locators.uploadPage.metadataOnlyCheckbox
    );

    const isChecked = await checkbox
      .locator('input[type="checkbox"]')
      .isChecked();

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
    const filePath = path.join(__dirname, "..", appConfig.dataFolderPath, "UploadFiles", filename);
    await this.page.setInputFiles('input[type="file"]', filePath);
    console.log(`[BasePage] Uploading file: ${filePath}`);
  }

  /**
   * Upload a file and confirm by clicking the "Upload" button in Uppy.
   * @param filename Name of the file to upload
   */
  async uploadFileAndConfirm(filename: string) {
    await this.uploadFile(filename);

    const uploadBtn = this.page.locator(
      this.locators.uploadPage.uploadFilesButton
    );
    await expect(uploadBtn).toBeEnabled({ timeout: 10000 });

    await uploadBtn.click();

    const uploaded = this.page.locator(
      this.locators.uploadPage.uploadedFile(filename)
    );

    await expect(uploaded).toBeVisible({ timeout: 15000 });
    await this.page.evaluate(() => window.scrollTo(0, 0));

    console.log(`[DepositPage] Uploaded and confirmed file: ${filename}`);
  }

  // Selects a 'Resource type' from the dropdown
  async selectResourceType(optionLabel: string): Promise<void> {
    const dropdown = this.page.locator(
      this.locators.uploadPage.resourceTypeDropdown
    );
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

  // Fill the publication date field. If no date is provided, current date is used.
  async fillPublicationDate(date?: string): Promise<void> {
    const dateToUse = date ?? getCurrentDateFormatted();
    await this.page
      .locator(this.locators.uploadPage.publicationDateField)
      .fill(dateToUse);
  }

  // Fill the creator/family name field ('Add creator' pop-up dialog)
  async fillCreatorFamilyName(name: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.familyNameField)
      .fill(name);
  }

  // Fill the creator/given name field ('Add creator' pop-up dialog)
  async fillCreatorGivenName(name: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.givenNameField).fill(name);
  }

  /*
  // Upload a random file using the FileUploadHelper
  async uploadFile(filename: string): Promise<void> {
    const helper = new FileUploadHelper(this.page);
    await helper.uploadRandomFileAndConfirm();
  }
    */

  // BUTTONS -----------------------------------------------------------------------------

  // Click the 'Browse files' link
  async clickBrowseFiles(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.browseFilesButton).click();
  }

  // Click the 'Add Creator' button
  async clickAddCreatorButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.addCreatorButton).click();
  }

  // Click the 'Save' button after adding a creator
  async clickAddCreatorSaveButton(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.saveAddCreatorButton)
      .nth(1)
      .click();
  }

  // Click the 'Preview' button and return a new PreviewPage instance
  async clickPreview(): Promise<PreviewPage> {
    await this.page.locator(this.locators.uploadPage.previewButton).click();
    await this.page.waitForLoadState("networkidle");
    const previewPage = this.availablePages.previewPage;
    // Ensure the preview page is fully loaded before returning
    await previewPage.validatePageLoaded();
    return previewPage;
  }

  // Click the 'Save Draft' button
  async clickSave(): Promise<void> {
    const saveDraftButton = this.page.locator(
      this.locators.uploadPage.saveDraftButton
    );
    await saveDraftButton.click();
    // this makes the API call that can take some time on server so that network idle is not enough
    await this.page.waitForLoadState("networkidle");
    await expect(saveDraftButton).not.toHaveClass(/loading/);
    // Scroll to top to see the error message if there is any
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // Click the 'Publish' button
  async clickPublish(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.publishButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Click confirmation 'Publish' button ('Are you sure you want to publish this record?' dialog)
  async confirmPublication(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.publishButton)
      .nth(1)
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  // Click the 'Edit' button
  async clickEditButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.editButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Click the 'Delete' button
  async clickDeleteButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.deleteButton).click();
    await this.page.waitForLoadState("networkidle");
  }

  // Click delete confirmation button
  async confirmDeletion(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.confirmDeleteButton)
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Private helper to verify toast messages on the page.
   * @param expectedText The text content that should appear in the toast notification.
   */
  private async verifyToastMessage(expectedText: string): Promise<void> {
    const toast = this.page.locator(
      this.locators.uploadPage.toastMessage(expectedText)
    );
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText(new RegExp(expectedText, "i"));
  }

  // Verify that the "Save Draft" toast message is displayed
  async verifySaveDraftMessage(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.draftSaved);
  }

  // Verify that the "Record Published" toast message is displayed
  async verifySuccessfulPublishMessage(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.recordPublished);
  }

  // Verify that the "Record Deleted" toast message is displayed
  async verifyRecordWasDeleted(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.recordDeleted);
  }

  // Verify that a specific title is visible on the page
  async verifyTitleIsVisible(title: string): Promise<void> {
    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  /**
   * Helper to verify that these error messages are shown on the page.
   * @param expectedErrors The expected error messages (strings or regex patterns). Pass
   * empty array and onlyThese=true to verify that no error messages
   * are shown.
   * @param onlyThese If true, verifies that only these messages are present.
   * If false, verifies that at least these messages are present.
   * Default is true.
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
    const { unmatchedErrors, unmatchedErrorMessages } =
      this._matchErrorMessages(expectedErrors, foundErrors);

    if (unmatchedErrors.length > 0) {
      throw new Error(
        `Expected error messages not found: ${unmatchedErrors
          .map((e) =>
            e.field ? `[${e.field}] ${e.message}` : e.message.toString()
          )
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
   * Matches and removes errors from the errorMessages array.
   * If we match an error, we will remove it from the "errorMessages" array
   * so that at the end we can see if there are any unmatched errors.
   * @param messages The list of message locators to check.
   * @param errorMessages The array of expected error messages.
   * @returns The updated array of unmatched error messages.
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

  private async _getErrorFieldAndMessage(field: Locator) {
    const errorMessage = await field
      .locator(this.locators.uploadPage.errorMessageInsideField)
      .innerText({ timeout: 100 });

    try {
      return {
        errorMessage,
        fieldName: await field
          .locator("label[for]")
          .first()
          .getAttribute("for"),
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

  // WAITS --------------------------------------------------------------------------------

  async waitForUploadComplete(fileName: string): Promise<void> {
    await this.page.waitForSelector(
      this.locators.uploadPage.uploadCompleteBar(),
      { state: "visible", timeout: 20000 }
    );
    console.log(`Upload complete for file: ${fileName}`);
  }

  /**
   * async fillAndSubmit(data: Record&lt;string, any>): Promise&lt;DepositPage> {
   *
   * }
   */
}
