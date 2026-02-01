import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function recordLandingPageTests(test: InvenioTest) {
  test.describe("Record Landing Page", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      // Open application and log in
      await homePage.openPage();
      await homePage.login();
    });

    test("Versions", async ({
      myDashboardPage,
      recordDetailPage,
      depositPage,
    }) => {
      // Navigate to "My Dashboard"
      await myDashboardPage.navigateToMyDashboard();

      // Open the detail page of the first record
      await myDashboardPage.firstRecordDetail();

      // Click the "New version" button
      await recordDetailPage.clickNewVersion();

      // Upload a file for the new version
      await depositPage.uploadFileAndConfirm("Anon.jpg");

      // Fill publication date with today's date
      await depositPage.fillPublicationDate();

      // Publish the new version and confirm
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Retrieve the record title after publishing
      const recordTitle = await recordDetailPage.getRecordTitle();

      // Navigate back to dashboard and enable "View all versions"
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.clickVersionsToggle();

      // Verify the record title appears in the dashboard list
      const isMatching = await myDashboardPage.isRecordTitleMatching(recordTitle);
      expect(isMatching).toBeTruthy();

      // Open the first record again
      await myDashboardPage.firstRecordDetail();

      // Verify that Version v2 is present
      const isV2Present = await recordDetailPage.isVersionV2Present();
      expect(isV2Present).toBeTruthy();

      // Navigate to Version v1
      await recordDetailPage.clickVersionV1();

      // Verify that Version v1 label is present
      const isV1Present = await recordDetailPage.isVersionV1Present();
      expect(isV1Present).toBeTruthy();
    });
  });
}