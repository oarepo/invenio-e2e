import { Locators } from "../locators";
import { SearchPage } from "./searchPage";
import { BasePage } from "./basePage";
import { DepositPage } from "./depositPage";

/**
 * Class representing a home page with search functionality.
 */

export class HomePage<T extends Locators = Locators> extends BasePage<T> {

  // NAVIGATION -------------------------------------------------------------------------

  /*
   * Navigate to the Home page.
   * @returns The home page instance to allow method chaining.
   */
  async openPage(): Promise<void> {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
    await this.validatePageLoaded();
  }

  // VALIDATION --------------------------------------------------------------------------
  /**
   * Validates that the home page has loaded by checking for the search field.
   */
  async validatePageLoaded(): Promise<void> {
    await super.validatePageLoaded();
    await this.page.waitForSelector(this.locators.homePage.searchField);
  }

  // FIELDS ------------------------------------------------------------------------------

  // Method to fill in the search field
  async fillSearchField(query: string): Promise<void> {
    const searchInput = this.page.locator(this.locators.homePage.searchField);
    await searchInput.fill(query);
    await this.expect(searchInput).toHaveValue(query);
  }

  // BUTTONS -----------------------------------------------------------------------------

  // Method to submit the search
  async submitSearch(): Promise<SearchPage> {
    const submitButton = this.page.locator(this.locators.homePage.searchButton);
    await submitButton.click();
    await this.page.waitForLoadState("networkidle");
    const nextPage = this.availablePages.searchPage;
    await nextPage.validatePageLoaded();
    return nextPage;
  }

  /**
   * Clicks on the Quick Create drop-down.
   */
  async clickQuickCreateButton(): Promise<void> {
    const quickCreateBtn = this.page.locator(
      this.locators.homePage.quickCreateButton
    );
    await quickCreateBtn.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigates to the Communities page by clicking the header link.
   */
  async goToCommunitiesPage(): Promise<void> {
    const communitiesLink = this.page.locator(
      this.locators.header.communitiesLink
    );
    await communitiesLink.click();
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector(this.locators.communitiesPage.pageTitle, {
      state: "visible",
    });
  }

  // FLOWS -------------------------------------------------------------------------------

  /**
   * Performs a search operation by filling the search field and submitting the search.
   *
   * @param query  The search query to fill in the search field.
   * @returns The search page after performing the search.
   */
  async performSearch(query: string): Promise<SearchPage> {
    await this.fillSearchField(query);
    return await this.submitSearch();
  }

  /**
   * Opens Quick Create and selects "New community".
   */
  async selectNewCommunity(): Promise<void> {
    await this.clickQuickCreateButton();
    const newCommunityItem = this.page.locator(
      this.locators.homePage.newCommunityMenuItem
    );
    await newCommunityItem.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Opens Quick Create and selects "New upload".
   * @returns The deposit page after selecting new upload.
   */
  async selectNewUpload(): Promise<DepositPage> {
    await this.clickQuickCreateButton();
    const newUploadItem = this.page.locator(
      this.locators.homePage.newUploadMenuItem
    );
    await newUploadItem.waitFor({ state: "visible", timeout: 5000 });
    await newUploadItem.click();
    await this.page.waitForLoadState("networkidle");

    const depositPage = new DepositPage({
      page: this.page,
      locators: this.locators,
      availablePages: this.availablePages,
      services: this.services,
      expect: this.expect,
    });
    await depositPage.validatePageLoaded();
    return depositPage;
  }
}
