import { BasePage } from "./basePage";
import { Locators } from "../locators";

/**
 * Page object representing the Administration page and its related functionality.
 * Provides methods for navigating, validating, and interacting with administration features like banners.
 * @template T - The locators type, defaults to Locators.
 */
export class AdministrationPage<T extends Locators = Locators> extends BasePage<T> {
  // NAVIGATION -------------------------------------------------------------------------

  /**
   * Navigate to the Administration page.
   * @returns The administration page instance to allow method chaining.
   */
  async openPage() {
    await this.page.goto("/administration");
    await this.page.waitForLoadState("networkidle");
    await this.validatePageLoaded();
  }

  /**
   * Navigate to the banners management section.
   * Clicks the banners section link and waits for the section to load.
   */
  async navigateToBannersSection() {
    const bannersSectionLink = this.page.locator(this.locators.administrationPage.bannersSectionLink);
    await bannersSectionLink.click();
    await this.page.waitForLoadState("networkidle");
    const bannersSectionHeader = this.page.locator(this.locators.administrationPage.bannersSectionHeader);
    await this.expect(bannersSectionHeader).toBeVisible();
  }

  /**
   * Navigate to the banner creation page.
   * Clicks the create banner button and waits for the creation form to load.
   */
  async navigateToBannersCreation() {
    const createBannerButton = this.page.locator(this.locators.administrationPage.createBannerLink);
    await createBannerButton.click();
    await this.page.waitForLoadState("networkidle");
    const bannerCreationHeader = this.page.locator(this.locators.administrationPage.createBannerHeader);
    await this.expect(bannerCreationHeader).toBeVisible();
  }

  // VALIDATION --------------------------------------------------------------------------

  /**
   * Validates that the administration page has loaded by checking for the page title.
   */
  async validatePageLoaded() {
    await super.validatePageLoaded();
    const administrationBody = await this.page.waitForSelector(this.locators.administrationPage.administrationBody);
    await administrationBody.waitForSelector(this.locators.administrationPage.dashboardHeader);
  }

  /**
   * Validates that no banners are present in the search results.
   * Checks for the empty results placeholder text.
   */
  async validateNoBannersArePresent() {
    const searchResults = this.page.locator(this.locators.administrationPage.bannersSearchResultsSection);
    const emptyResults = searchResults.locator(this.locators.administrationPage.bannersSearchResultsPlaceholderText);
    await this.expect(emptyResults).toBeVisible();
  }

  /**
   * Validates that a banner with the specified message is present in the search results.
   * @param message The banner message to search for.
   */
  async validateBannerIsPresent(message: string) {
    const isPresent = await this.isBannerInSearchTable(message);
    this.expect(isPresent).toBeTruthy();
  }

  /**
   * Validates that a banner is displayed on a specific site page.
   * Navigates to the specified URL path and checks if the banner is visible.
   * @param message The banner message to look for.
   * @param urlPath The URL path to navigate to.
   */
  async validateBannerPresentOnSite(message: string, urlPath: string) {
    await this.page.goto(urlPath);
    await this.page.waitForLoadState("networkidle");
    await super.validatePageLoaded();
    this.expect(await this.isBannerPresentOnSite(message)).toBeTruthy();
  }

  // BUTTONS -----------------------------------------------------------------------------

  /**
   * Clicks the submit button to create a new banner.
   */
  async clickSubmitCreateBanner() {
    const submitButton = this.page.locator(this.locators.administrationPage.createBannerSubmitButton);
    await submitButton.click();
  }

  // FIELDS ------------------------------------------------------------------------------

  /**
   * Fills in the banner message field.
   * @param message The message text to enter in the banner message field.
   */
  async fillBannerMessage(message: string) {
    const messageFieldIframe = this.page.locator(this.locators.administrationPage.createBannerMessageInput);
    const messageTextArea = messageFieldIframe.contentFrame().locator("body#tinymce");
    await messageTextArea.fill(message);
  }

  /**
   * Fills in the banner URL path field.
   * @param urlPath The URL path where the banner should be displayed.
   */
  async fillBannerUrlPath(urlPath: string) {
    const urlPathField = this.page.locator(this.locators.administrationPage.createBannerUrlPathInput);
    await urlPathField.fill(urlPath);
  }

  // VERIFICATION ------------------------------------------------------------------------

  /**
   * Checks if a banner with the specified message is visible in the search results table.
   * @param message The banner message to search for.
   * @returns A promise that resolves to true if the banner is visible, false otherwise.
   */
  async isBannerInSearchTable(message: string) {
    const searchResults = this.page.locator(this.locators.administrationPage.bannersSearchResultsSection);
    const bannerRow = searchResults.locator(this.locators.administrationPage.searchBannerRow(message));
    return bannerRow.isVisible();
  }

  /**
   * Checks if a banner with the specified message is visible on the current site page.
   * @param message The banner message to look for.
   * @returns A promise that resolves to true if the banner is visible on the site, false otherwise.
   */
  async isBannerPresentOnSite(message: string) {
    const bannerOnSite = this.page.locator(this.locators.administrationPage.findBannerOnSite(message));
    return bannerOnSite.isVisible();
  }

  async waitForSubmission() {
    await this.page.waitForLoadState("networkidle");
    await this.expect(this.page.locator(this.locators.administrationPage.bannersSearchResultsSection)).toBeVisible();
    await this.expect(this.page.locator(this.locators.administrationPage.bannersSearchResultsRows).first()).toBeVisible();
  }
}
