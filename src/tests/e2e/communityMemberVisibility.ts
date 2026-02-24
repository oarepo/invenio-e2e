import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function communityMemberVisibilityTests(test: InvenioTest) {
  test.describe("Communities – Member visibility", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Member Visibility - Hidden", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
      loginPage,
    }) => {
      // Open first community -> Members
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      // Set visibility Hidden for current user
      await communityDetailPage.setMyMemberVisibility("Hidden");

      // Logout and verify user is not visible in Members list
      await loginPage.logout();

      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      expect(await communityDetailPage.isCurrentUserListed()).toBeFalsy();
    });

    //-----------------------------------------------------------------------------------

    test("Member Visibility - Public", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
      loginPage,
    }) => {
      // Open first community -> Members
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      // Set visibility Public for current user
      await communityDetailPage.setMyMemberVisibility("Public");

      // Logout and verify user is visible in Members list
      await loginPage.logout();

      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      expect(await communityDetailPage.isCurrentUserListed()).toBeTruthy();
    });
  });
}