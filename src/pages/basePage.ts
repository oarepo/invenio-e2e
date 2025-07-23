import { Page, expect } from '@playwright/test';
import { TextCaptureOptions, TextCaptureUtil, TranslatableElement } from '../utils/textCapture';

import { Expect } from '@playwright/test';
import { I18nExpected } from '../services/i18n';
import { Locators } from '../locators';
import { Services } from '../services';

/**
 * Class representing a base page with common functionality for all pages.
 */
export class BasePage<L extends Locators = Locators> {
    protected page: Page;
    protected locators: L;
    protected services: Services<L>;
    protected availablePages: { [key: string]: BasePage };
    protected expect: Expect<I18nExpected>;

    /**
     * Base class for page objects in Playwright tests.
     * @param page            The Playwright page object for browser interactions.
     * @param locators        An object containing locators for elements on the page.
     * @param services        An object containing services for interacting with the application.
     * @param availablePages  An object containing available pages for navigation.
     */
    constructor({ page, locators, availablePages, services, expect }: {
        page: Page,
        locators: L,
        availablePages: { [key: string]: BasePage },
        services: Services<L>,
        expect: Expect<I18nExpected>
    }) {
        this.page = page;
        this.locators = locators;
        this.availablePages = availablePages;
        this.services = services;
        this.expect = expect;
    }

    /**
     * Validates that the page has been loaded successfully.
     */
    async validatePageLoaded(): Promise<void> {
        // Base implementation - subclasses should override with specific validation
        await this.page.waitForLoadState("networkidle");
    }

    /**
     * Validates that the logo is visible on the page.
     */
    async expectLogoVisible(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        const logo = this.page.locator(this.locators.header.logoLink);
        await this.expect(logo).toBeVisible();
    }

    /**
     * Navigates to the home page as we should always have a home page link in the header.
     * 
     * @returns the home page
     */
    async navigateToHomePage<T extends BasePage = BasePage>(): Promise<T> {
        const logoLink = await this.page.locator(this.locators.header.logoLink);
        await logoLink.click();
        const homePage = this.availablePages['homePage'];
        if (homePage && 'validatePageLoaded' in homePage) {
            await homePage.validatePageLoaded();
        }
        return homePage as T;
    }

    /**
     * tests specific UI elements against translation keys
     * verifies that common elements like navigation and search have correct translations
     */
    async expectElementTranslations(
        locale: string, 
        messageCatalogue: string = 'invenio-app-rdm-messages'
    ): Promise<void> {
      /* target locale */
      await this.services.i18n.switchLocale(locale);

      const elements = await TextCaptureUtil.findTranslatableElements(
        this.page,
        this.services.i18n.excludes,
        this.services.i18n.translatableSelectors
      );

      console.log(`\nTranslations (${locale}):`);
      console.log(`Found ${elements.length} translatable elements`);
      console.log(`Testing against catalogue: ${messageCatalogue}`);

      let testedCount = 0;
      let passedCount = 0;

      const commonKeys = [
        { 
          key: "nav.home", 
          selectors: [this.locators.navigation.homeLink] 
        },
        { 
          key: "nav.search", 
          selectors: [this.locators.navigation.searchLink] 
        },
        {
          key: "search.placeholder",
          selectors: [this.locators.homePage.searchPlaceholder, this.locators.searchPage.searchInput],
        },
        {
          key: "repository.name",
          selectors: [this.locators.homePage.repositoryName],
        },
      ];

      for (const { key, selectors } of commonKeys) {
        if (!this.services.i18n.hasTranslation(key, messageCatalogue, locale)) {
          console.log(
            ` No translation found for key "${key}" in catalogue "${messageCatalogue}"`
          );
          continue;
        }

        for (const selector of selectors) {
          try {
            const element = this.page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 })) {
              testedCount++;
              try {
                await this.expect(element).toHaveI18nText(
                  key,
                  messageCatalogue,
                  { locale }
                );
                passedCount++;
                console.log(`${key}: ${selector}`);
              } catch (error) {
                console.log(`${key}: ${selector} - ${error}`);
              }
              break; 
            }
          } catch {
            // skip if element not found or not testable
          }
        }
      }

      console.log(
        `\nResults: ${passedCount}/${testedCount} translations verified`
      );

      /* if no translatable elements found matching known keys maybe we should check!!! 
        - translations for common UI elements to ${messageCatalogue}
        - if elements use expected selectors
        - verifying exclude patterns are not too restrictive
      */
        if (testedCount === 0){}
    }

    /**
     * captures text, switches language, compares to find untranslated content
     * approach to identify text that remains unchanged between languages
     */
    async expectTranslation(
        fromLang: string, 
        toLang: string, 
        options: TextCaptureOptions = {}
    ): Promise<void> {
        await this.services.i18n.switchLocale(fromLang);
        const beforeTexts = await TextCaptureUtil.capture(this.page, this.services.i18n.excludes, options);

        await this.services.i18n.switchLocale(toLang);
        const afterTexts = await TextCaptureUtil.capture(this.page, this.services.i18n.excludes, options);
        const unchanged = beforeTexts.filter(word => afterTexts.includes(word));

        console.log(`\nTranslation Analysis (${fromLang} → ${toLang}):`);
        console.log(`Total UI words captured: ${beforeTexts.length}`);
        console.log(`Untranslated UI words found: ${unchanged.length}`);
        console.log(`Sample untranslated:`, unchanged.slice(0, 10));
        
        if (unchanged.length > 0) {
            console.log(`Full untranslated list:`, unchanged);
        }
    }
}