/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function depositionTests(test: InvenioTest) {
  test.describe("Deposition Tests", () => {
    // User must be logged in before opening deposition page
    test.beforeEach(async ({ loginPage, homePage }) => {
      await homePage.openPage();
      const loggedInHomePage = await homePage.login();
      expect(loggedInHomePage).toBe(homePage);
    });

    test("Create metadata-only record", async ({
      homePage,
      previewPage,
      formService,
      depositionData,
    }) => {
      console.log("Running metadata-only deposition test...");

      // Navigate to 'New upload'
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      const { filledData } = await formService.fillForm(
        depositPage,
        depositionData["metadataOnlyRecord"]
      );

      expect(await depositPage.clickPreview()).toBe(previewPage);
      await previewPage.verifyData(filledData);
    });

    //------------------------------------------------------------------------------------------------------

    test("Upload a file2", async ({ homePage, formService, depositionData }) => {
      console.log("Running upload file test...");

      // Navigate to 'New upload'
      const depositPage = await homePage.selectNewUpload();

      // Fill the deposition form by following the provided steps and check for errors
      const { filledData } = await formService.fillForm(
        depositPage,
        depositionData["recordWithFile"]
      );

      // Verify the file name is in the filled data
      const uploadedFiles = filledData
        .flat()
        .filter((item) => typeof item === "string");
      expect(uploadedFiles).toContain("Anon.jpg");
    });

    //------------------------------------------------------------------------------------------------------

    test("Upload a file", async ({
      homePage,
      previewPage,
      formService,
      depositionData,
    }) => {
      const depositPage = await homePage.selectNewUpload();
      await formService.fillForm(depositPage, depositionData["recordWithFile"]);

      expect(await depositPage.clickPreview()).toBe(previewPage);

      const expectedFile = depositionData["recordWithFile"].files[0];
      await previewPage.verifyUploadedFile(expectedFile);
    });

    //------------------------------------------------------------------------------------------------------

    test("Try to save an empty record", async ({
      homePage,
      previewPage,
      formService,
      depositionData,
    }) => {
      console.log("Running empty record deposition test...");

      // Navigate to 'New upload'
      const depositPage = await homePage.selectNewUpload();

      // Check for errors
      await formService.fillForm(depositPage, depositionData["emptyRecord"]);
    });

    //------------------------------------------------------------------------------------------------------

    test("Save draft", async ({ homePage, previewPage }) => {
      // Navigate to 'New upload'
      const depositPage = await homePage.selectNewUpload();

      // Click the "Save draft" button
      await depositPage.clickSave();

      // Verify success message after saving draft
      await depositPage.verifySaveDraftMessage();

      // Navigate to "Preview"
      expect(await depositPage.clickPreview()).toBe(previewPage);

      // Verify draft state in Preview
      await previewPage.verifySaveDraftPreview();
      await previewPage.verifySaveDraftPreviewVersions();
    });

    //------------------------------------------------------------------------------------------------------

    test("Apply Embargo", async ({ homePage, depositPage, recordDetailPage }) => {
      // Navigate to "New upload" (Deposit page)
      const dp = await homePage.selectNewUpload();

      // Fill minimum required metadata
      await depositPage.fillTitle('Embargo record ${Date.now()}');
      await depositPage.addCreator({ familyName: "Tester", givenName: "Embargo" });

      // Resource type is usually required
      await depositPage.selectResourceType("Dataset"); // change if your instance uses different label

      // Upload a file
      await depositPage.uploadFileAndConfirm("Anon.jpg");

      // Set record access to "Full record -> Restricted"
      await depositPage.setFullRecordAccess("Restricted");

      // Enable embargo and fill embargo fields
      await depositPage.enableEmbargo(true);
      await depositPage.setEmbargoUntilDateRelative({ days: 7 }); // e.g. +7 days
      await depositPage.fillEmbargoReason('Automated embargo reason ${Date.now()}');

      // Publish the record and confirm
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Verify embargo status on the record landing page
      expect(await recordDetailPage.isEmbargoedLabelPresent()).toBeTruthy();
      expect(await recordDetailPage.isEmbargoedStatusSectionPresent()).toBeTruthy();
    });
  });
}
