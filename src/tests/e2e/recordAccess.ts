import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function recordAccessTests(test: InvenioTest) {
  test.describe("Records – Access control", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Full Record Restricted", async ({
      myDashboardPage,
      recordDetailPage,
      depositPage,
      loginPage,
      communitiesPage,
      homePage,
      communityDetailPage,
    }) => {
      // Open first record and edit
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();
      await recordDetailPage.clickEdit();

      // Set access and publish
      await depositPage.setFullRecordAccess("Restricted");
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Verify restricted label + access status section on landing page
      expect(await recordDetailPage.isRestrictedLabelPresent()).toBeTruthy();
      expect(await recordDetailPage.isRecordAccessStatusSectionPresent()).toBeTruthy();

      // Logout and verify restricted record is not visible in community listing
      await loginPage.logout();

      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      expect(await communityDetailPage.verifyRestrictedRecordNotPresent()).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Files Only Restricted", async ({
      myDashboardPage,
      recordDetailPage,
      depositPage,
      loginPage,
      communitiesPage,
      homePage,
      communityDetailPage,
    }) => {
      // Open first record and edit
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();
      await recordDetailPage.clickEdit();

      // Set files-only restricted and publish
      await depositPage.setFilesOnlyAccess("Restricted");
      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Verify restricted files message on landing page
      expect(await recordDetailPage.checkRestrictedMessagePresence()).toBeTruthy();

      // Logout and verify record behavior in community detail (basic smoke)
      await loginPage.logout();

      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      // If you want stricter assertion later: open first record and verify message again
      await communityDetailPage.navigateToFirstRecord();
      expect(await recordDetailPage.checkRestrictedMessagePresence()).toBeTruthy();
    });
  });
}
