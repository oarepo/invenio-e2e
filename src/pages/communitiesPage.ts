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

  /**
   * Opens a community detail page by clicking the community name link.
   */
  async openCommunityByName(name: string): Promise<void> {
    const link = this.page
      .locator(this.locators.communitiesPage.communityNameLink)
      .filter({
        hasText: name,
      });

    await link.first().waitFor({ state: "visible" });
    await link.first().click();
  }

  /**
   * Waits until the communities list is loaded (first community name is visible).
   * @param timeoutMs Max time to wait (default 30s).
   */
  async waitForListLoaded(timeoutMs: number = 30000): Promise<void> {
    const firstName = this.page
      .locator(this.locators.communitiesPage.communityNameLink)
      .first();
    await expect(firstName).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Waits until a community with the given name appears in the list.
   * @param name Community name to wait for.
   * @param timeoutMs Max time to wait (default 30s).
   */
  async waitForCommunityVisible(
    name: string,
    timeoutMs: number = 30000
  ): Promise<void> {
    const match = this.page
      .locator(this.locators.communitiesPage.communityNameLink)
      .filter({ hasText: name })
      .first();

    await expect(match).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Refreshes the page and waits until a community with the given name appears in the list.
   */
  async refreshAndWaitForCommunity(
    name: string,
    timeoutMs: number = 30000
  ): Promise<void> {
    await this.waitForListLoaded(timeoutMs);

    const match = this.page
      .locator(this.locators.communitiesPage.communityNameLink)
      .filter({ hasText: name })
      .first();

    try {
      await expect(match).toBeVisible({ timeout: Math.min(5000, timeoutMs) });
      return;
    } catch {
      await this.page.reload({ waitUntil: "domcontentloaded" });
      await this.waitForListLoaded(timeoutMs);
      await expect(
        this.page
          .locator(this.locators.communitiesPage.communityNameLink)
          .filter({ hasText: name })
          .first()
      ).toBeVisible({ timeout: timeoutMs });
    }
  }

  // FIELDS ------------------------------------------------------------------------------

  /**
   * Fills the search input field on the Communities page.
   * @param query The text to enter into the search field.
   */
  async fillSearchField(query: string): Promise<void> {
    const searchInput = this.page.locator(this.locators.communitiesPage.searchField);
    await searchInput.fill(query);
  }

  // BUTTONS ------------------------------------------------------------------------------

  /**
   * Clicks the search button to submit the community search.
   * Waits for network idle state after clicking.
   */
  async submitSearch(): Promise<void> {
    const submitButton = this.page.locator(this.locators.communitiesPage.searchButton);
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
  async verifyCommunityName(expectedName: string, index: number = 0): Promise<void> {
    const communityNameElement = this.page
      .locator(this.locators.communitiesPage.communityNameLink)
      .nth(index);
    await expect(communityNameElement).toHaveText(expectedName);
  }

  /**
   * Returns the visible name of the first community in the list.
   * Useful for comparisons between logged-in and logged-out state.
   */
    async getFirstCommunityNameText(): Promise<string> {
    return await this.getFirstText(
      this.locators.communitiesPage.communityNameLink
    );
  }

  /**
   * Verify that the community is not present in the list.
   * @param name Name of the community expected to be absent.
   */
  async verifyCommunityNotPresent(name: string) {
    const locator = this.page.locator(`.community-list .community-item`, {
      hasText: name,
    });
    await expect(locator).toHaveCount(0);
  }
}
