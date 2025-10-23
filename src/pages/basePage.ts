import { Expect, Page } from "@playwright/test";
import { I18nExpected, Services } from "../services";
import { AllPages } from ".";
import { HomePage } from "./homePage";
import { Locators } from "../locators";

/**
 * Abstract class representing a base page with common functionality for all pages.
 * Provides validation, navigation, and common flows like login.
 */
export class BasePage<
  L extends Locators = Locators,
  S extends Services<L> = Services<L>,
  ExpectExtension extends I18nExpected = I18nExpected,
  P extends AllPages<L> = AllPages<L>,
> {
  protected page: Page;
  protected locators: L;
  protected availablePages: P;
  protected services: S;
  protected expect: Expect<ExpectExtension>;

  /**
   * Creates a new instance of the abstract base page.
   * @param conf Configuration object.
   * @param conf.page Playwright Page object representing the current page.
   * @param conf.locators An object containing locators for elements on the page.
   * @param conf.availablePages An object containing available pages for navigation.
   * @param conf.services An object containing available services.
   * @param conf.expect Playwright expect function with extensions.
   */
  constructor({
    page,
    locators,
    availablePages,
    services,
    expect,
  }: {
    page: Page;
    locators: L;
    availablePages: P;
    services: S;
    expect: Expect<ExpectExtension>;
  }) {
    this.page = page;
    this.locators = locators;
    this.availablePages = availablePages;
    this.services = services;
    this.expect = expect;
  }

  /**
   * Validates that the loaded page has a logo link in the header.
   */
  async validatePageLoaded(): Promise<void> {
    await this.page.waitForSelector(this.locators.header.logoLink);
  }

  /**
   * Validates that the logo is visible on the page.
   */
  async expectLogoVisible(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
    const logo = this.page.locator(this.locators.header.logoLink);
    await this.expect(logo).toBeVisible();
  }

  /**
   * Navigates to the home page as we should always have a home page link in the header.
   * @returns The home page instance.
   */
  async navigateToHomePage(): Promise<HomePage> {
    const logoLink = this.page.locator(this.locators.header.logoLink);
    await logoLink.click();

    const homePage = this.availablePages.homePage;
    await homePage.validatePageLoaded();
    return homePage;
  }

  /**
   * Performs a login flow using the login service.
   * @param credentials Optional credentials object.
   * @param credentials.username Optional username to log in with.
   * @param credentials.password Optional password to log in with.
   * @returns The current page instance for method chaining.
   */
  async login(credentials?: { username?: string; password?: string }): Promise<this> {
    const loginService = this.services.login;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await loginService.login(this as any, credentials);
    this.expect(
      await loginService.isUserLoggedIn(),
      "User should be logged in after login flow."
    ).toBe(true);
    return this;
  }
}
