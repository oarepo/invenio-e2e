import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { expect } from "@playwright/test";

/**
 * CommunitiesPage represents the Communities section of the application.
 * Provides methods to navigate, search, and verify communities.
 */

export class CommunitiesPage<T extends Locators = Locators> extends BasePage<T> {

  // NAVIGATION ------------------------------------------------------------------------

  /**
   * Navigates to the first community in the "My communities" list.
   * Waits until the community card and the records tab are visible.
   */
  async navigateToFirstCommunity(): Promise<void> {
    console.log("Navigating to the first Community detail...");

    const firstCommunity = this.page.locator(
      this.locators.communitiesPage.firstCommunityCard
    );

    await firstCommunity.first().waitFor({ state: "visible" });
    await firstCommunity.first().click();

    await this.page.waitForSelector(this.locators.communitiesPage.recordsTab, {
      state: "visible",
    });
  }

  // FIELDS ------------------------------------------------------------------------------

  /**
   * Fills the search input field on the Communities page.
   * @param query The text to enter into the search field.
   */
  async fillSearchField(query: string): Promise<void> {
    const searchInput = this.page.locator(
      this.locators.communitiesPage.searchField
    );
    await searchInput.fill(query);
  }

  // BUTTONS ------------------------------------------------------------------------------

  /**
   * Clicks the search button to submit the community search.
   * Waits for network idle state after clicking.
   */
  async submitSearch(): Promise<void> {
    const submitButton = this.page.locator(
      this.locators.communitiesPage.searchButton
    );
    await submitButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  // FLOWS -------------------------------------------------------------------------------

  /**
   * Performs a full search on the Communities page by filling the search field
   * and clicking the submit button.
   * @param query The search query to search for.
   */
  async performSearch(query: string): Promise<void> {
    await this.fillSearchField(query);
    await this.submitSearch();
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Verifies that the community name at the given index matches the expected name.
   * @param expectedName The expected community name to verify.
   * @param index Index of the community in the list (default 0).
   */
  async verifyCommunityName(
    expectedName: string,
    index: number = 0
  ): Promise<void> {
    const communityNameElement = this.page
      .locator(this.locators.communitiesPage.communityNameLink)
      .nth(index);
    const communityName = await communityNameElement.textContent();
    expect(communityName?.trim()).toBe(expectedName);
  }
}
