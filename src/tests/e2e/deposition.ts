import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function depositionTests(test: InvenioTest) {
  test.describe("Deposition Tests", () => {
    // User must be logged in before opening deposition page
    test.beforeEach(async ({ loginPage, homePage }) => {
      await homePage.openPage();
      const loggedInHomePage = await homePage.login()
      expect(loggedInHomePage).toBe(homePage);
    });

    test("Create and publish metadata-only record", async ({ homePage, previewPage, formService, depositionData }) => {
      console.log("Running metadata-only deposition test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      const { filledData } = await formService.fillForm(depositPage, depositionData["metadataOnlyRecord"]);

      await expect(await depositPage.clickPreview()).toBe(previewPage);
      await previewPage.verifyData(filledData);
    });

    test("Upload a file", async ({ homePage, formService, depositionData }) => {
      console.log("Running upload file test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      const { filledData } = await formService.fillForm(depositPage, depositionData["recordWithFile"]);

      // Verify the file name is in the filled data
      const uploadedFiles = filledData.flat().filter(item => typeof item === 'string');
      expect(uploadedFiles).toContain("Anon.jpg");
    });

    test("Try to save an empty record", async ({ homePage, previewPage, formService, depositionData }) => {
      console.log("Running empty record deposition test...");

      // Navigate to 'New upload'
      await homePage.openPage();
      const depositPage = await homePage.selectNewUpload();

      // Check for errors
      await formService.fillForm(depositPage, depositionData["emptyRecord"]);
    });
  });
}
