import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { PreviewPage } from "./previewPage";
import { expect } from "@playwright/test";
import { ExpectedTexts } from "../locators/expectedTexts";
import { getCurrentDateFormatted } from "../fixtures/utils";
import { FileUploadHelper } from "../helpers/fileUploadHelper";
import { uploadData } from "../data/uploadData";

/**
 * Class representing a Deposit page in the application.
 * Contains methods to interact with fields, buttons, and perform verifications.
 */
export class DepositPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION ------------------------------------------------------------------------

  /*
   * Navigate to the Deposit page.
   * @param url Optional URL to navigate to (if not provided, defaults to "/")
   */
  async openPage(url?: string): Promise<void> {
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
  async fillTitleField(title: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.titleField).fill(title);
  }

  // Fill in the 'Description' field 
  async fillDescriptionField(description: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.descriptionField)
      .fill(description);
  }

  // Selects a 'Resource type' from the dropdown
  async selectResourceType(
    currentlySelected: string | null = null
  ): Promise<void> {
    const typeToSelect = uploadData.resourceType(currentlySelected);
    const dropdown = this.page.locator(
      this.locators.uploadPage.resourceTypeDropdown
    );
    await dropdown.click();

    // Locate the exact option by text
    const option = dropdown.locator(".item .text", {
      hasText: new RegExp(`^${typeToSelect}$`),
    });

    if ((await option.count()) === 0) {
      throw new Error(`Resource type "${typeToSelect}" not found in dropdown`);
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
  async fillCreatorName(name: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.familyNameField)
      .fill(name);
  }

  // Upload a random file using the FileUploadHelper
  async uploadRandomFile(): Promise<void> {
    const helper = new FileUploadHelper(this.page);
    await helper.uploadRandomFileAndConfirm();
  }

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
  async clickAddcreatorSaveButton(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.saveAddCreatorButton)
      .nth(1)
      .click();
  }

  // Click the 'Preview' button and return a new PreviewPage instance
  async clickPreview(): Promise<PreviewPage> {
    await this.page.locator(this.locators.uploadPage.previewButton).click();

    const previewPage = new PreviewPage({
      page: this.page,
      locators: this.locators,
      availablePages: this.availablePages,
      services: this.services,
      expect: this.expect,
    });

    // Ensure the preview page is fully loaded before returning
    await previewPage.validatePageLoaded();
    return previewPage;
  }

  // Click the 'Save Draft' button
  async clickSaveDraft(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.saveDraftButton).click();
  }

  // Click the 'Publish' button
  async clickPublish(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.publishButton).click();
  }

  // Click confirmation 'Publish' button ('Are you sure you want to publish this record?' dialog)
  async confirmPublication(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.publishButton)
      .nth(1)
      .click();
  }

  // Click the 'Edit' button
  async clickEditButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.editButton).click();
  }

  // Click the 'Delete' button
  async clickDeleteButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.deleteButton).click();
  }

  // Click delete confirmation button
  async confirmDeletion(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.confirmDeleteButton)
      .click();
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Private helper to verify toast messages on the page
   * @param expectedText The expected text in the toast message
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

  // FLOWS -------------------------------------------------------------------------------

  /**
    async fillAndSubmit(data: Record<string, any>): Promise<DepositPage> {
 
    }
     */
}
