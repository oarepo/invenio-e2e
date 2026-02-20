import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function newCommunityTests(test: InvenioTest) {
  test.describe("Communities – New Community", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Create new community", async ({
      homePage,
      newCommunityPage,
      communitiesPage,
    }) => {
      // Navigate to "New community" via Quick Create
      await homePage.selectNewCommunity();

      // Fill community name & identifier
      const communityName = await newCommunityPage.fillCommunityName(
        `Community ${Date.now()}`
      );
      await newCommunityPage.fillCommunityIdentifier();

      // Create community
      await newCommunityPage.clickCreateCommunity();

      // Navigate to Communities list
      await homePage.goToCommunitiesPage();
      await communitiesPage.refreshAndWaitForCommunity(communityName, 30000);

      // Verify the new community is first in the list
      await communitiesPage.verifyCommunityName(communityName, 0);
    });

    //-----------------------------------------------------------------------------------

    test("Communities - Search", async ({
      homePage,
      newCommunityPage,
      communitiesPage,
      communitySearchPage,
    }) => {
      // Create a new community to search for
      await homePage.selectNewCommunity();

      const communityName = await newCommunityPage.fillCommunityName(
        `Community ${Date.now()}`
      );
      await newCommunityPage.fillCommunityIdentifier();
      await newCommunityPage.clickCreateCommunity();

      // Navigate to listing and search
      await homePage.goToCommunitiesPage();
      await communitiesPage.refreshAndWaitForCommunity(communityName, 30000);

      await communitiesPage.fillSearchField(communityName);
      await communitiesPage.submitSearch();

      // Verify the community is shown
      // await communitiesPage.verifyCommunityName(communityName, 0);

      // Change sorting
      await communitySearchPage.selectSortOption("Oldest");

      // Verify sorting selection
      const isOldestSelected = await communitySearchPage.isSortOptionSelected("Oldest");
      expect(isOldestSelected).toBeTruthy();
    });

    //-----------------------------------------------------------------------------------

    test("Community Visibility - Public", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
      loginPage,
    }) => {
      // Navigate to the 'Communities' page
      await homePage.goToCommunitiesPage();

      // Save the name of the first community and logout
      const firstCommunityNameBeforeLogout =
        await communitiesPage.getFirstCommunityNameText();
      await loginPage.logout();

      // Navigate to the 'Communities' page again and validate the public community
      await homePage.goToCommunitiesPage();
      const firstCommunityNameAfterLogout =
        await communitiesPage.getFirstCommunityNameText();

      // Compare the text content directly
      expect(firstCommunityNameBeforeLogout).toBe(firstCommunityNameAfterLogout);

      // Navigate to the first community and check the record exists
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.verifyDateTag();
    });

    //-----------------------------------------------------------------------------------

    test("Community Visibility - Restricted", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
      loginPage,
    }) => {
      // Navigate to the Communities page
      await homePage.goToCommunitiesPage();

      // Open the first community detail and store its header name
      await communitiesPage.navigateToFirstCommunity();
      const firstCommunityHeaderName =
        await communityDetailPage.getCommunityHeaderName();

      // Go to Settings -> Privileges
      await communityDetailPage.navigateToSettingsSection();
      await communityDetailPage.navigateToPrivilegesSection();

      // Set community visibility to Restricted and save
      await communityDetailPage.setCommunityVisibility("Restricted");
      await communityDetailPage.clickSaveButtonPrivileges();

      // Logout
      await loginPage.logout();

      // Navigate to the Communities page again and open the first visible community
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      // Restricted community should not be visible when logged out
      const communityHeaderNameAfterLogout =
        await communityDetailPage.getCommunityHeaderName();
      expect(communityHeaderNameAfterLogout).not.toBe(firstCommunityHeaderName);
    });

    //-----------------------------------------------------------------------------------

    test("Edit community", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Navigate to the Communities page and open the first community detail
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToSettingsSection();

      // Change community name and save
      const editedCommunityName = await communityDetailPage.editCommunityName();
      await communityDetailPage.clickSaveButton();

      // Verify the name was successfully updated
      await communityDetailPage.verifyUpdatedCommunityName(editedCommunityName);
    });

    //-----------------------------------------------------------------------------------

    test("Delete community", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Navigate to the Communities page and open the first community detail
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();
      await communityDetailPage.navigateToSettingsSection();

      // Change community name and save
      const editedCommunityName = await communityDetailPage.editCommunityName();
      await communityDetailPage.clickSaveButton();

      // Open delete dialog
      await communityDetailPage.clickDeleteCommunityButton();

      // Confirm deletion options
      await communityDetailPage.clickMembersConfirmCheckbox();
      await communityDetailPage.clickRecordsConfirmCheckbox();
      await communityDetailPage.clickSlugConfirmCheckbox();

      // Fill delete confirmation input and permanently delete the community
      await communityDetailPage.fillDeleteConfirmationInput();
      await communityDetailPage.clickPermanentlyDeleteButton();

      // Verify the deleted community is not present in the list
      await homePage.goToCommunitiesPage();
      await communitiesPage.verifyCommunityNotPresent(editedCommunityName);
    });

    //-----------------------------------------------------------------------------------

    test("Search - In the Community", async ({
      homePage,
      communitiesPage,
      communityDetailPage,
    }) => {
      // Navigate to the first community in the list
      await homePage.goToCommunitiesPage();
      await communitiesPage.navigateToFirstCommunity();

      // Verify the number of found results (3)
      const isThreeResultsPresent = await communityDetailPage.isNumberPresent(3);
      expect(isThreeResultsPresent).toBeTruthy();

      const checkboxLabels = ["Embargoed", "Metadata-only", "Open"];

      for (const label of checkboxLabels) {
        // Toggle filter on and validate the number of results (1)
        await communityDetailPage.toggleAccessStatusCheckbox(label);
        const isOneResultPresent = await communityDetailPage.isNumberPresent(1);
        expect(isOneResultPresent).toBeTruthy();

        // Toggle filter off and validate the number of results (3)
        await communityDetailPage.toggleAccessStatusCheckbox(label);
        const isThreeResultsAfterUncheck = await communityDetailPage.isNumberPresent(3);
        expect(isThreeResultsAfterUncheck).toBeTruthy();
      }
    });
  });
}
