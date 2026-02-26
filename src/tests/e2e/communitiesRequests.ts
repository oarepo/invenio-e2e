import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function communityRequestsTests(test: InvenioTest) {
  test.describe("Communities – Requests", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Accept and Publish Request", async ({
      homePage,
      newCommunityPage,
      communityDetailPage,
      depositPage,
      recordDetailPage,
      communitiesPage,
    }) => {
      // Create a new community
      await homePage.selectNewCommunity();
      const communityName = await newCommunityPage.fillCommunityName(
        `Community ${Date.now()}`
      );
      await newCommunityPage.fillCommunityIdentifier();
      await newCommunityPage.clickCreateCommunity();

      // Create a record and submit it for review into that community
      await homePage.selectNewUpload();

      await depositPage.fillTitle(`Record ${Date.now()}`);
      await depositPage.addCreator({ familyName: "Tester", givenName: "Request" });
      await depositPage.selectResourceType("Image");
      await depositPage.uploadFileAndConfirm("Anon.jpg");

      await depositPage.openCommunitySelector();
      await depositPage.selectMyCommunitiesTab();
      await depositPage.selectCommunityByName(communityName);

      await depositPage.submitForReview();
      expect(await recordDetailPage.isSubmittedForReviewLabelVisible()).toBeTruthy();

      // Go to the community -> Requests -> Accept & publish
      await homePage.goToCommunitiesPage();
      await communitiesPage.openCommunityByName(communityName);

      await communityDetailPage.navigateToRequestsSection();
      await communityDetailPage.acceptAndPublishFirstRequest();

      // Verify it ended up in Closed
      await communityDetailPage.navigateToClosedRequests();
      expect(await communityDetailPage.hasAnyClosedRequest()).toBeTruthy();
    });
  });
}