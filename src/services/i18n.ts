import { Expect, Locator, Page, expect } from '@playwright/test';

import type { Locators } from '../locators';

/**
 * type that adds translation checking methods to Playwright's expect function.
 */
export type I18nExpected = Record<string, any> & {
    toHaveI18nText(
        locator: Locator, 
        translationKey: string, 
        messageCatalogue?: string, 
        options?: { locale?: string }
    ): Promise<{
        pass: boolean;
        message: () => string;
    }>;
};

/**
 * structure for organizing translation data by catalogue, locale, and key
 * example: translations['invenio-app-rdm']['en']['search.placeholder'] = 'Search records...'
 */
export interface Translations {
    [catalogue: string]: {
        [locale: string]: {
            [key: string]: string;
        };
    };
}

/**
 * interface for changing languages and checking translations in tests
 * provides methods to switch locales and validate translated content
 */
export interface I18nServiceInterface<L extends Locators> {
    switchLocale(locale: string): Promise<void>;
    currentLocale: string;
    excludes: string[];
    translatableSelectors: string[];
    extendExpect<T extends Record<string, any> = {}>(expect: Expect<T>): Expect<T & I18nExpected>;
    hasTranslation(key: string, messageCatalogue: string, locale?: string): boolean;
}

/**
 * service for handling internationalization (i18n) in E2E tests
 * switches between languages and validates that UI elements are properly translated
 */
export class I18nService<L extends Locators> implements I18nServiceInterface<L> {
    private page: Page;
    private locators: L;
    private currentLocaleValue: string;
    private translations: Translations;
    private untranslatedStrings: string[];
    private translatableSelectorsValue: string[];

    constructor(
        page: Page,
        locators: L,
        initialLocale: string = 'en',
        translations: Translations = {},
        untranslatedStrings: string[] = [],
        translatableSelectors: string[] = []
    ) {
        this.page = page;
        this.locators = locators;
        this.currentLocaleValue = initialLocale;
        this.translations = translations;
        this.untranslatedStrings = untranslatedStrings;
        this.translatableSelectorsValue = translatableSelectors;
    }

    get currentLocale(): string {
        return this.currentLocaleValue;
    }

    get excludes(): string[] {
        return this.untranslatedStrings;
    }

    get translatableSelectors(): string[] {
        return this.translatableSelectorsValue;
    }

    getAvailableCatalogues(): string[] {
        return Object.keys(this.translations);
    }

    hasTranslation(key: string, messageCatalogue: string, locale?: string): boolean {
        const targetLocale = locale || this.currentLocaleValue;
        return !!(this.translations[messageCatalogue]?.[targetLocale]?.[key]);
    }

    get_localized_text(key: string, messageCatalogue: string, locale?: string): string {
        const targetLocale = locale || this.currentLocaleValue;
        const translation = this.translations[messageCatalogue]?.[targetLocale]?.[key];
        
        if (!translation) {
            console.warn(`Missing translation for key "${key}" in catalogue "${messageCatalogue}" for locale "${targetLocale}"`);
            return `[MISSING: ${key}]`;
        }
        
        return translation;
    }

    async switchLocale(locale: string): Promise<void> {
        this.currentLocaleValue = locale;

        try {
            const languageSelector = this.page.locator(this.locators.footer.languageSelector);
            if (await languageSelector.isVisible()) {
                await languageSelector.click();
                
                const localeOption = this.page.locator(this.locators.footer.languageOption)
                    .filter({ hasText: new RegExp(locale, 'i') })
                    .or(this.page.locator(`[href*="ln=${locale}"]`))
                    .or(this.page.locator(`[data-locale="${locale}"]`));
                
                if (await localeOption.first().isVisible()) {
                    await localeOption.first().click();
                    await this.page.waitForLoadState('networkidle');
                    return;
                }
            }
        } catch (error) {
            console.warn('UI language switching failed, falling back to URL method:', error.message);
        }
        const url = new URL(this.page.url());
        url.searchParams.set('ln', locale);
        await this.page.goto(url.toString());
        await this.page.waitForLoadState('networkidle');
    }

    extendExpect<T extends Record<string, any> = {}>(expect: Expect<T>): Expect<T & I18nExpected> {
        const i18nService = this;
        return expect.extend({
            async toHaveI18nText(
                locator: Locator, 
                translationKey: string, 
                messageCatalogue: string = 'test',
                options: { locale?: string } = {}
            ) {
                const targetLocale = options.locale || i18nService.currentLocale;
                const expectedText = i18nService.get_localized_text(translationKey, messageCatalogue, targetLocale);
                
                if (expectedText.startsWith('[MISSING:')) {
                    return {
                        message: () => `Translation key "${translationKey}" not found in catalogue "${messageCatalogue}" for locale "${targetLocale}"`,
                        pass: false,
                    };
                }

                const actualText = await locator.textContent();
                const pass = actualText?.includes(expectedText) || false;

                return {
                    message: () => pass 
                        ? `Expected element not to contain translation "${expectedText}" but it did`
                        : `Expected element to contain translation "${expectedText}" but got "${actualText}"`,
                    pass,
                };
            },
        }) as Expect<T & I18nExpected>;
    }
}