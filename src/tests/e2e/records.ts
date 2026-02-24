import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function recordLandingPageTests(test: InvenioTest) {
  test.describe("Record Landing Page", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Versions", async ({ myDashboardPage, recordDetailPage, depositPage }) => {
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

    //-----------------------------------------------------------------------------------

    test("Communities - Search", async ({ homePage, communitySearchPage }) => {
      // Go to Home (defensive: some flows may leave you elsewhere)
      await homePage.openPage();

      // Trigger global search (should navigate to search results context)
      await homePage.submitSearch();

      // Select "Oldest" and verify
      await communitySearchPage.selectSortOption("Oldest");
      expect(await communitySearchPage.isSortOptionSelected("Oldest")).toBeTruthy();

      // Select "Newest" and verify
      await communitySearchPage.selectSortOption("Newest");
      expect(await communitySearchPage.isSortOptionSelected("Newest")).toBeTruthy();

      // Select "Version" and verify
      await communitySearchPage.selectSortOption("Version");
      expect(await communitySearchPage.isSortOptionSelected("Version")).toBeTruthy();

      // Select "Most viewed" and verify
      await communitySearchPage.selectSortOption("Most viewed");
      expect(
        await communitySearchPage.isSortOptionSelected("Most viewed")
      ).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Share", async ({ myDashboardPage, recordDetailPage }) => {
      // Navigate to "My Dashboard"
      await myDashboardPage.navigateToMyDashboard();

      // Open the detail page of the first record
      await myDashboardPage.firstRecordDetail();

      // Test data (preferably sourced from your test data fixtures)
      const email = "test.user@example.com";

      // Open Share dialog
      await recordDetailPage.openShareDialog();

      // Open "Add people" section and add a user by email
      await recordDetailPage.openAddPeople();
      await recordDetailPage.addUserToShare(email);

      // Set permission level to "Can edit"
      await recordDetailPage.setSharePermission("Can edit");

      // Confirm adding the selected user
      await recordDetailPage.confirmShareAdd();

      // Verify that the user appears in the share list
      expect(await recordDetailPage.isUserInShareList(email)).toBeTruthy();

      // Verify that the user has the correct permission
      expect(
        await recordDetailPage.isPermissionPresent(email, "Can edit")
      ).toBeTruthy();
    });
  });
}
