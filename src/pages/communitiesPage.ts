import { Locators } from "../locators";
import { BasePage } from "./basePage";
import { expect } from "@playwright/test";

/**
 * Class representing the Communities page.
 * Contains methods to interact with the communities list and details.
 */
export class CommunitiesPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION ------------------------------------------------------------------------

  /**
   * Navigate to the first community in the list of "My communities".
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
   * Fills the search field on the Communities page.
   * @param query The search query to enter.
   */
  async fillSearchField(query: string): Promise<void> {
    const searchInput = this.page.locator(
      this.locators.communitiesPage.searchField
    );
    await searchInput.fill(query);
  }

  // BUTTONS ------------------------------------------------------------------------------

  /**
   * Submits the community search.
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
   * Performs a search on the Communities page.
   * @param query The search query to search for.
   */
  async performSearch(query: string): Promise<void> {
    await this.fillSearchField(query);
    await this.submitSearch();
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Verifies that the community name at the given index matches the expected name.
   * @param expectedName The expected community name.
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
