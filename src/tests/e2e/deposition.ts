import { InvenioTest } from "../../fixtures";
import { uploadData } from "../../data/uploadData";
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

export function depositionTests(test: InvenioTest) {
  test.describe("Deposition Tests", () => {
    test("Create and publish metadata-only deposition", async ({ homePage, previewPage, defaultUserLoggedIn, formService, depositionData }) => {
      console.log("Running metadata-only deposition test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      await formService.fillForm(depositPage, depositionData["metadataOnlyRecord"]);
    });

    // test("Upload a file", async ({ homePage, previewPage, defaultUserLoggedIn, depositionService, depositionData }) => {
    //   console.log("Running upload file test...");

    //   // Navigate to 'New upload'
    //   await homePage.openPage();
    //   const depositPage = await homePage.selectNewUpload();

    //   // Fill the deposition form by following the provided steps
    //   depositionService.fillDepositionForm(depositPage, depositionData[dataProfile]);

    //   // // Upload random file (folder: UploadFiles)
    //   // await depositPage.uploadRandomFile();

    //   // // Fill in 'Creators' field - by faker
    //   // await depositPage.clickAddCreatorButton();
    //   // const fakeName = faker.person.lastName();
    //   // await depositPage.fillCreatorName(fakeName);
    //   // await depositPage.clickAddcreatorSaveButton();

    //   // // Fill in 'Title' field - by faker
    //   // const fakeTitle = uploadData.recordTitle();
    //   // await depositPage.fillTitleField(fakeTitle);

    //   // // Fill in 'Resource type' field - random from the list - UploadData.ts
    //   // const resourceType = uploadData.resourceType();
    //   // await depositPage.selectResourceType(resourceType);

    //   // // Confirm by clicking 'Publish' button
    //   // await depositPage.clickPublish();
    //   // await depositPage.confirmPublication();

    //   // // Check the title of the new created record in the detail
    //   // const exists = await previewPage.checkRecordExists(fakeTitle);
    //   // expect(exists).toBeTruthy();
    // });
  });
}
