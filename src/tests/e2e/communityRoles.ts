import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";
import type { RoleUsers } from "../../fixtures";

import type {
  HomePage,
  LoginPage,
  MyDashboardPage,
  CommunitiesPage,
  CommunityDetailPage,
  RecordDetailPage,
} from "../../pages";

type CommunityRole = "Reader" | "Curator" | "Manager" | "Owner";

function getUserByRole(roleUsers: RoleUsers, role: CommunityRole) {
  switch (role) {
    case "Reader":
      return roleUsers.reader;
    case "Curator":
      return roleUsers.curator;
    case "Manager":
      return roleUsers.manager;
    case "Owner":
      return roleUsers.owner;
  }
}

async function runRoleScenario(args: {
  role: CommunityRole;
  shouldSeeEdit: boolean;
  roleUsers: RoleUsers;

  homePage: HomePage;
  loginPage: LoginPage;
  myDashboardPage: MyDashboardPage;
  communitiesPage: CommunitiesPage;
  communityDetailPage: CommunityDetailPage;
  recordDetailPage: RecordDetailPage;
}) {
  const {
    role,
    shouldSeeEdit,
    roleUsers,
    homePage,
    loginPage,
    myDashboardPage,
    communitiesPage,
    communityDetailPage,
    recordDetailPage,
  } = args;

  const user = getUserByRole(roleUsers, role);

  // 1) Invite user with role to first community
  await homePage.goToCommunitiesPage();
  await communitiesPage.navigateToFirstCommunity();
  await communityDetailPage.navigateToMembersSection();
  await communityDetailPage.inviteMember(user.email, role);

  // 2) Login as invited user and accept invitation (if any)
  await loginPage.logout();
  await loginPage.loginAs(user.email, user.password);

  await myDashboardPage.navigateToMyDashboard();
  await myDashboardPage.navigateToRequests();
  if (!(await myDashboardPage.isAllDoneMessagePresent())) {
    await myDashboardPage.acceptRequestAtIndex(0);
  }

  // 3) Open first community and go to first record
  await homePage.goToCommunitiesPage();
  await communitiesPage.navigateToFirstCommunity();

  // If your methods have different names, change ONLY these 2 lines
  await communityDetailPage.navigateToRecordsSection();
  await communityDetailPage.navigateToFirstRecord();

  // 4) Assert permission by Edit button visibility
  const canSeeEdit = await recordDetailPage.isEditButtonVisible();
  expect(canSeeEdit).toBe(shouldSeeEdit);
}

export function communityRolesTests(test: InvenioTest) {
  test.describe("Communities – Roles", () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Role - Reader", async ({
      roleUsers,
      homePage,
      loginPage,
      myDashboardPage,
      communitiesPage,
      communityDetailPage,
      recordDetailPage,
    }) => {
      await runRoleScenario({
        role: "Reader",
        shouldSeeEdit: false,
        roleUsers,
        homePage,
        loginPage,
        myDashboardPage,
        communitiesPage,
        communityDetailPage,
        recordDetailPage,
      });
    });

    test("Role - Curator", async ({
      roleUsers,
      homePage,
      loginPage,
      myDashboardPage,
      communitiesPage,
      communityDetailPage,
      recordDetailPage,
    }) => {
      await runRoleScenario({
        role: "Curator",
        shouldSeeEdit: true,
        roleUsers,
        homePage,
        loginPage,
        myDashboardPage,
        communitiesPage,
        communityDetailPage,
        recordDetailPage,
      });
    });

    test("Role - Manager", async ({
      roleUsers,
      homePage,
      loginPage,
      myDashboardPage,
      communitiesPage,
      communityDetailPage,
      recordDetailPage,
    }) => {
      await runRoleScenario({
        role: "Manager",
        shouldSeeEdit: true,
        roleUsers,
        homePage,
        loginPage,
        myDashboardPage,
        communitiesPage,
        communityDetailPage,
        recordDetailPage,
      });
    });

    test("Role - Owner", async ({
      roleUsers,
      homePage,
      loginPage,
      myDashboardPage,
      communitiesPage,
      communityDetailPage,
      recordDetailPage,
    }) => {
      await runRoleScenario({
        role: "Owner",
        shouldSeeEdit: true,
        roleUsers,
        homePage,
        loginPage,
        myDashboardPage,
        communitiesPage,
        communityDetailPage,
        recordDetailPage,
      });
    });
  });
}
