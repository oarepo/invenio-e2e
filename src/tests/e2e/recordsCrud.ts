import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function recordsCrudTests(test: InvenioTest) {
  test.describe("Records – CRUD", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Bulk File Upload", async ({ homePage, depositPage, myDashboardPage }) => {
      const fileCount = 7;

      // New upload
      await homePage.selectNewUpload();

      // Minimal required metadata (adjust if your instance requires more)
      await depositPage.fillTitle(`Bulk upload ${Date.now()}`);
      await depositPage.addCreator({ familyName: "Bulk", givenName: "Tester" });
      await depositPage.selectResourceType("Image");

      // Upload multiple files
      for (let i = 0; i < fileCount; i++) {
        await depositPage.uploadFileAndConfirm("Anon.jpg");
      }

      // Publish + confirm
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Go to dashboard and verify record exists (basic smoke)
      await myDashboardPage.navigateToMyDashboard();
      expect(await myDashboardPage.isAnyRecordVisible()).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Form Validation", async ({ homePage, depositPage }) => {
      // New upload
      await homePage.selectNewUpload();

      // Upload a file only (no metadata)
      await depositPage.uploadFileAndConfirm("Anon.jpg");

      // Publish + confirm (should show validation errors)
      await depositPage.clickPublish();
      await depositPage.confirmPublicationIfPresent();

      // Verify validation errors are displayed
      expect(await depositPage.hasValidationErrors()).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Edit Record", async ({ myDashboardPage, recordDetailPage, depositPage }) => {
      // Navigate to dashboard and open first record
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();

      // Edit
      await recordDetailPage.clickEdit();

      const newTitle = `Edited title ${Date.now()}`;
      await depositPage.fillTitle(newTitle);

      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Verify title on landing page
      const actualTitle = await recordDetailPage.getRecordTitle();
      expect(actualTitle).toContain("Edited title");
    });

    //-----------------------------------------------------------------------------------

    test("Delete Record", async ({ myDashboardPage, recordDetailPage, depositPage }) => {
      // Navigate to dashboard and open first record
      await myDashboardPage.navigateToMyDashboard();

      const titleBefore = await myDashboardPage.getFirstRecordTitle();
      await myDashboardPage.firstRecordDetail();

      // Edit -> delete in deposit UI
      await recordDetailPage.clickEdit();
      await depositPage.deleteRecord();

      // Verify record is gone from dashboard list
      await myDashboardPage.navigateToMyDashboard();
      expect(await myDashboardPage.isRecordTitleAbsent(titleBefore)).toBeTruthy();
    });
  });
}
