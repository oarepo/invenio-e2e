import { Page, expect } from '@playwright/test';

import { HomePage } from './homePage';
import { Locators } from '../locators';

/**
 * Class representing a base page with common functionality for all pages.
 */
export class BasePage<T extends Locators = Locators> {
    protected page: Page;
    protected locators: T;
    protected availablePages: { [key: string]: object };

    /**
     * Creates a new instance of the abstract base page.
     * 
     * @param page  Playwright Page object representing the current page.
     * @param locators  An object containing locators for elements on the page.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor({ page, locators, availablePages }: {
        page: Page,
        locators: T,
        availablePages: { [key: string]: object }
    }) {
        this.page = page;
        this.locators = locators;
        this.availablePages = availablePages;
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
        await expect(logo).toBeVisible();
    }

    // LOCALIZATION
    /**
     * Switch page language via UI interaction.
     */
    async toggleLocale(locale: string): Promise<void> {
        const selectors = [
            `[data-language="${locale}"]`,
            `[lang="${locale}"]`,
            `a[href*="?ln=${locale}"]`,
            `button[data-locale="${locale}"]`,
            `.language-${locale}`,
            `#language-${locale}`
        ];

        let clicked = false;
        for (const selector of selectors) {
            const element = this.page.locator(selector);
            if (await element.isVisible()) {
                await element.click();
                clicked = true;
                break;
            }
        }

        if (!clicked) {
            const dropdown = this.page.locator('[data-toggle="dropdown"]:has-text("Language"), .language-switcher, #language-dropdown');
            if (await dropdown.isVisible()) {
                await dropdown.click();
                await this.page.waitForTimeout(500);
                
                for (const selector of selectors) {
                    const element = this.page.locator(selector);
                    if (await element.isVisible()) {
                        await element.click();
                        clicked = true;
                        break;
                    }
                }
            }
        }

        if (clicked) {
            await this.page.waitForLoadState('networkidle');
            await this.validateAfterLanguageSwitch(locale);
        }
    }

    /**
     * Override for page-specific validation after language switch.
     */
    protected async validateAfterLanguageSwitch(locale: string): Promise<void> {
        await this.validatePageLoaded();
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
        const homePage: HomePage = this.availablePages['homePage'] as HomePage;
        await homePage.validatePageLoaded();
        return homePage;
    }
}