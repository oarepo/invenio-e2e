import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function communityFiltersTests(test: InvenioTest) {
  test.describe("Community records – Filters", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Filter - Access status", async ({ homePage, communitiesPage, communityDetailPage }) => {
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      // Initial results
      expect(await communityDetailPage.isNumberPresent(3)).toBeTruthy();

      const labels = ["Embargoed", "Metadata-only", "Open"];
      for (const label of labels) {
        await communityDetailPage.toggleFilterCheckbox(label);
        expect(await communityDetailPage.isNumberPresent(1)).toBeTruthy();

        await communityDetailPage.toggleFilterCheckbox(label);
        expect(await communityDetailPage.isNumberPresent(3)).toBeTruthy();
      }
    });

    //-----------------------------------------------------------------------------------

    test("Filter - Resource types", async ({ homePage, communitiesPage, communityDetailPage }) => {
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      expect(await communityDetailPage.isNumberPresent(3)).toBeTruthy();

      // Resource type checkbox (e.g. Image)
      await communityDetailPage.toggleFilterCheckbox("Image");

      // Same access statuses loop (as in old tests)
      const labels = ["Embargoed", "Metadata-only", "Open"];
      for (const label of labels) {
        await communityDetailPage.toggleFilterCheckbox(label);
        expect(await communityDetailPage.isNumberPresent(1)).toBeTruthy();

        await communityDetailPage.toggleFilterCheckbox(label);
        expect(await communityDetailPage.isNumberPresent(3)).toBeTruthy();
      }

      // Combine Open + Embargoed -> expect 2
      await communityDetailPage.toggleFilterCheckbox("Open");
      await communityDetailPage.toggleFilterCheckbox("Embargoed");
      expect(await communityDetailPage.isNumberPresent(2)).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Filter - Versions (View all versions)", async ({
      homePage,
      myDashboardPage,
      recordDetailPage,
      depositPage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Create a new version first (same intent as old test)
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();

      await recordDetailPage.clickNewVersion();
      await depositPage.uploadFileAndConfirm("Anon.jpg");
      await depositPage.fillPublicationDate();
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Now open community and toggle "View all versions"
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      expect(await communityDetailPage.isNumberPresent(1)).toBeTruthy();

      await communityDetailPage.toggleViewAllVersions();
      expect(await communityDetailPage.isNumberPresent(2)).toBeTruthy();
    });
  });
}