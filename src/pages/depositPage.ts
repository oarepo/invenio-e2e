import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { PreviewPage } from "./previewPage";
import { expect } from "@playwright/test";
import { ExpectedTexts } from "../locators/expectedTexts";
import { getCurrentDateFormatted } from "../fixtures/utils";
import { FileUploadHelper } from "../helpers/fileUploadHelper";

/**
 * Class representing a deposit page.
 */

export class DepositPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION ------------------------------------------------------------------------

  /*
   * Navigate to the Deposit page.
   * @returns The deposit page instance.
   */
  async openPage(url?: string): Promise<void> {
    // TODO: if no url, new deposition
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

  async fillTitleField(title: string): Promise<void> {
    await this.page.locator(this.locators.uploadPage.titleField).fill(title);
  }

  async fillDescriptionField(description: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.descriptionField)
      .fill(description);
  }

  async selectResourceType(type: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.resourceTypeDropdown)
      .selectOption({ label: type });
  }

  async fillPublicationDate(date?: string): Promise<void> {
    const dateToUse = date ?? getCurrentDateFormatted();
    await this.page
      .locator(this.locators.uploadPage.publicationDateField)
      .fill(dateToUse);
  }

  async fillCreatorName(name: string): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.familyNameField)
      .fill(name);
  }

  async uploadRandomFile(): Promise<void> {
    const helper = new FileUploadHelper(this.page);
    await helper.uploadRandomFile();
  }

  // BUTTONS -----------------------------------------------------------------------------

  async clickBrowseFiles(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.browseFilesButton).click();
  }

  async clickUploadFilesButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.uploadFilesButton).click();
  }

  async clickAddCreatorButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.addCreatorButton).click();
  }
  async clickPreview(): Promise<PreviewPage> {
    // Click the "Preview" button
    await this.page.locator(this.locators.uploadPage.previewButton).click();

    // Create a new instance of the PreviewPage, passing necessary dependencies
    const previewPage = new PreviewPage({
      page: this.page,
      locators: this.locators,
      availablePages: this.availablePages,
      services: this.services,
      expect: this.expect,
    });

    // Validate that the PreviewPage has loaded successfully
    await previewPage.validatePageLoaded();

    // Return the instance of PreviewPage for further interactions in the test
    return previewPage;
  }

  async clickSaveDraft(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.saveDraftButton).click();
  }

  async clickPublish(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.publishButton).click();
  }

  async confirmPublication(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.publishButton)
      .nth(1)
      .click();
  }

  async clickEditButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.editButton).click();
  }

  async clickDeleteButton(): Promise<void> {
    await this.page.locator(this.locators.uploadPage.deleteButton).click();
  }

  async confirmDeletion(): Promise<void> {
    await this.page
      .locator(this.locators.uploadPage.confirmDeleteButton)
      .click();
  }

  // VERIFICATION ------------------------------------------------------------------------

  private async verifyToastMessage(expectedText: string): Promise<void> {
    const toast = this.page.locator(
      this.locators.uploadPage.toastMessage(expectedText)
    );
    await expect(toast).toBeVisible();
    await expect(toast).toHaveText(new RegExp(expectedText, "i"));
  }

  async verifySaveDraftMessage(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.draftSaved);
  }

  async verifySuccessfulPublishMessage(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.recordPublished);
  }

  async verifyRecordWasDeleted(): Promise<void> {
    await this.verifyToastMessage(ExpectedTexts.recordDeleted);
  }

  async verifyTitleIsVisible(title: string): Promise<void> {
    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  // FLOWS -------------------------------------------------------------------------------

  /**
    async fillAndSubmit(data: Record<string, any>): Promise<DepositPage> {

    }
     */
}
