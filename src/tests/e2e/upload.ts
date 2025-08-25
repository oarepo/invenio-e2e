import { InvenioTest } from "../../fixtures";
import { uploadData } from "../../data/uploadData";
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

export function uploadTests(test: InvenioTest) {
  test.describe("Upload Tests", () => {
    test("Upload a file", async ({ homePage, previewPage, defaultUserLoggedIn }) => {
      console.log("Running upload file test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Upload random file (folder: UploadFiles)
      await depositPage.uploadRandomFile();

      // Fill in 'Creators' field - by faker
      await depositPage.clickAddCreatorButton();
      const fakeName = faker.person.lastName();
      await depositPage.fillCreatorName(fakeName);
      await depositPage.clickAddcreatorSaveButton();

      // Fill in 'Title' field - by faker
      const fakeTitle = uploadData.recordTitle();
      await depositPage.fillTitleField(fakeTitle);

      // Fill in 'Resource type' field - random from the list - UploadData.ts
      const resourceType = uploadData.resourceType();
      await depositPage.selectResourceType(resourceType);

      // Confirm by clicking 'Publish' button
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Check the title of the new created record in the detail
      const exists = await previewPage.checkRecordExists(fakeTitle);
      expect(exists).toBeTruthy();
    });
  });
}
