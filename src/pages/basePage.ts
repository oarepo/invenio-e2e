import { Expect, Page } from '@playwright/test';
import { I18nExpected, Services } from '../services';
import { AllPages } from '.';
import { HomePage } from './homePage';
import { Locators } from '../locators';

/**
 * Class representing a base page with common functionality for all pages.
 */
export class BasePage<L extends Locators = Locators,
    S extends Services<L> = Services<L>,
    ExpectExtension extends I18nExpected = I18nExpected,
    P extends AllPages<L> = AllPages<L>
> {
    readonly page: Page;
    protected locators: L;
    protected availablePages: P;
    protected services: S;
    protected expect: Expect<ExpectExtension>

    /**
     * Creates a new instance of the abstract base page.
     * 
     * @param page  Playwright Page object representing the current page.
     * @param locators  An object containing locators for elements on the page.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor({ page, locators, availablePages, services, expect }: {
        page: Page,
        locators: L,
        availablePages: P,
        services: S,
        expect: Expect<ExpectExtension>
    }) {
        this.page = page;
        this.locators = locators;
        this.availablePages = availablePages;
        this.services = services;
        this.expect = expect;
    }

    // VALIDATION
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
        await this.page.waitForLoadState('networkidle');
        const logo = this.page.locator(this.locators.header.logoLink);
        await this.expect(logo).toBeVisible();
    }

    // NAVIGATION
    /**
     * Navigates to the home page as we should always have a home page link in the header.
     * 
     * @returns the home page
     */
    async navigateToHomePage(): Promise<HomePage> {
        const logoLink = await this.page.locator(this.locators.header.logoLink);
        await logoLink.click();

        const homePage = this.availablePages.homePage;
        await homePage.validatePageLoaded();
        return homePage;
    }

    // FLOWS
    async login(credentials?: any): Promise<this> {
        const loginService = this.services.login;
        await loginService.login(this as any, credentials);
        this.expect(
            await loginService.isUserLoggedIn(),
            'User should be logged in after login flow.'
        ).toBe(true);
        return this;
    }
}