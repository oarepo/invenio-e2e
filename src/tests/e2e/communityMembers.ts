import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function communityMembersTests(test: InvenioTest) {
  test.describe("Communities – Members & Invitations", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Accept Invitation", async ({
      homePage,
      loginPage,
      myDashboardPage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Logout and login as curator (invited user)
      await loginPage.logout();

      const curatorEmail = process.env.INVENIO_CURATOR_EMAIL ?? "curator@example.com";
      const curatorPassword = process.env.INVENIO_CURATOR_PASSWORD ?? "curator-password";
      await loginPage.loginAs(curatorEmail, curatorPassword);

      // Go to Requests in My dashboard and accept the first invitation
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.navigateToRequests();
      await myDashboardPage.acceptRequestAtIndex(0);

      // Go to Communities and verify "You" label is present in Members
      await myDashboardPage.navigateToCommunities();
      await myDashboardPage.navigateToFirstCommunity();

      await communityDetailPage.navigateToMembersSection();
      expect(await communityDetailPage.isYouLabelPresent()).toBeTruthy();

      // Defensive: open listing again (keeps test stable if detail navigation changes)
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
    });

    //-----------------------------------------------------------------------------------

    test("Cancel Invitation", async ({ loginPage, myDashboardPage }) => {
      // Logout and login as curator (invited user)
      await loginPage.logout();

      const curatorEmail = process.env.INVENIO_CURATOR_EMAIL ?? "curator@example.com";
      const curatorPassword = process.env.INVENIO_CURATOR_PASSWORD ?? "curator-password";
      await loginPage.loginAs(curatorEmail, curatorPassword);

      // Decline all requests until "All done!" appears
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.navigateToRequests();

      while (!(await myDashboardPage.isAllDoneMessagePresent())) {
        await myDashboardPage.declineRequestAtIndex(0);
      }

      expect(await myDashboardPage.isAllDoneMessagePresent()).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Invite New Member", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
    }) => {
      const inviteeEmail = process.env.INVENIO_INVITEE_EMAIL ?? "reader@example.com";

      // Navigate to first community -> Members
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      // Invite a member (Reader role is least privileged, stable for demo)
      await communityDetailPage.inviteMember(inviteeEmail, "Reader");

      // Go to Invitations and verify the invited member is present
      await communityDetailPage.openInvitationsTab();
      expect(await communityDetailPage.isInvitationPresent(inviteeEmail)).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Leave Community", async ({
      homePage,
      loginPage,
      myDashboardPage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Logout and login as curator (invited user)
      await loginPage.logout();

      const curatorEmail = process.env.INVENIO_CURATOR_EMAIL ?? "curator@example.com";
      const curatorPassword = process.env.INVENIO_CURATOR_PASSWORD ?? "curator-password";
      await loginPage.loginAs(curatorEmail, curatorPassword);

      // Accept invitation first (otherwise leaving might not be available)
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.navigateToRequests();
      if (!(await myDashboardPage.isAllDoneMessagePresent())) {
        await myDashboardPage.acceptRequestAtIndex(0);
      }

      // Go to community members and leave
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      await communityDetailPage.leaveCommunity();

      // Verify "no public members" placeholder (or similar) is shown
      expect(await communityDetailPage.isLeaveCommunityMessageVisible()).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Remove Member", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
    }) => {
      const memberEmailToRemove =
        process.env.INVENIO_REMOVE_EMAIL ?? "curator@example.com";

      // Navigate to first community -> Members
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToMembersSection();

      // Remove member (if present). After removal, verify it is not present.
      await communityDetailPage.removeMemberByEmail(memberEmailToRemove);

      // Re-open Members to refresh list
      await communityDetailPage.navigateToSettingsSection();
      await communityDetailPage.navigateToMembersSection();

      expect(await communityDetailPage.isMemberPresent(memberEmailToRemove)).toBeFalsy();
    });
  });
}
