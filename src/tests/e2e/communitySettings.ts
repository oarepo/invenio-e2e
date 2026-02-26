import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function communitySettingsTests(test: InvenioTest) {
  test.describe("Communities – Settings", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Submission review policy", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
      depositPage,
      myDashboardPage,
    }) => {
      // Open first community and change Review policy
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      await communityDetailPage.navigateToSettingsSection();
      await communityDetailPage.navigateToReviewPolicy();

      // Select "Allow curators..." option (index-based as in old tests)
      await communityDetailPage.selectSubmissionReviewPolicyByIndex(2);
      await communityDetailPage.clickSaveButton();

      // Create a record (basic publish smoke)
      await homePage.selectNewUpload();
      await depositPage.fillTitle(`Policy record ${Date.now()}`);
      await depositPage.addCreator({ familyName: "Tester", givenName: "Policy" });
      await depositPage.selectResourceType("Image");
      await depositPage.uploadFileAndConfirm("Anon.jpg");

      await depositPage.clickPublish();
      await depositPage.confirmPublication();

      // Defensive: verify some record exists on dashboard
      await myDashboardPage.navigateToMyDashboard();
      expect(await myDashboardPage.isAnyRecordVisible()).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Pages (Curation policy + About)", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Open first community -> Settings -> Pages
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      await communityDetailPage.navigateToSettingsSection();
      await communityDetailPage.navigateToPages();

      const curationPolicyText = `Curation policy ${Date.now()}`;
      const aboutText = `About page ${Date.now()}`;

      // Fill editors (TinyMCE iframe body)
      await communityDetailPage.fillCurationPolicy(curationPolicyText);
      await communityDetailPage.fillAboutPage(aboutText);

      await communityDetailPage.clickSaveButton();

      // Verify saved values on public sections
      await communityDetailPage.navigateToCurationPolicySection();
      expect(await communityDetailPage.getCurationPolicyText()).toContain(curationPolicyText);

      await communityDetailPage.navigateToAboutSection();
      expect(await communityDetailPage.getAboutText()).toContain(aboutText);
    });
  });
}
