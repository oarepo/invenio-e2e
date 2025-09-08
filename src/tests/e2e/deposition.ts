import { InvenioTest } from "../../fixtures";
import { uploadData } from "../../data/uploadData";
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

export function depositionTests(test: InvenioTest) {
  test.describe("Deposition Tests", () => {
    test("Create and publish metadata-only record", async ({ homePage, previewPage, defaultUserLoggedIn, formService, depositionData }) => {
      console.log("Running metadata-only deposition test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      await formService.fillForm(depositPage, depositionData["metadataOnlyRecord"]);
    });

    test("Upload a file", async ({ homePage, previewPage, defaultUserLoggedIn, formService, depositionData }) => {
      console.log("Running upload file test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      const { filledData } = await formService.fillForm(depositPage, depositionData["recordWithFile"], {
        order: 123
      });

      // // check that the file can be downloaded
      // const previewPage = depositPage.clickPreview();
      // previewPage.verifyData(filledData);
    });
  });
}
