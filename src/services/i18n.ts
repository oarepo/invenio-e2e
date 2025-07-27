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
 * Simplified structure for pre-compiled translations
 * example: translations['en']['search.placeholder'] = 'Search records...'
 * or: translations['en']['invenio_app_rdm:Home'] = 'Startseite'
 */
export interface Translations {
    [locale: string]: {
        [key: string]: string;
    };
}

/**
 * interface for changing languages and checking translations in tests
 * provides methods to switch locales and validate translated content
 */
export interface I18nServiceInterface<L extends Locators> {
    switchLocale(locale: string): Promise<void>;
    currentLocale: string;
    untranslatedStrings: string[];
    translatableSelectors: string[];
    translations: Translations;
    extendExpect<T extends Record<string, any> = {}>(expect: Expect<T>): Expect<T & I18nExpected>;
    hasTranslation(key: string, locale?: string, packageName?: string): boolean;
    get_localized_text(key: string, locale?: string, packageName?: string): string;
}

/**
 * service for handling internationalization (i18n) in E2E tests
 * switches between languages and validates that UI elements are properly translated
 */
export class I18nService<L extends Locators> implements I18nServiceInterface<L> {
    private page: Page;
    private locators: L;
    private currentLocaleValue: string;
    public translations: Translations;
    public untranslatedStrings: string[];
    public translatableSelectors: string[];

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
        this.translatableSelectors = translatableSelectors;
    }

    get currentLocale(): string {
        return this.currentLocaleValue;
    }



    getAvailableCatalogues(): string[] {
        return Object.keys(this.translations);
    }

    hasTranslation(key: string, locale?: string, packageName?: string): boolean {
        const targetLocale = locale || this.currentLocaleValue;
        const lookupKey = packageName ? `${packageName}:${key}` : key;
        return !!this.translations[targetLocale]?.[lookupKey];
    }

    get_localized_text(key: string, locale?: string, packageName?: string): string {
        const targetLocale = locale || this.currentLocaleValue;
        const lookupKey = packageName ? `${packageName}:${key}` : key;
        const translation = this.translations[targetLocale]?.[lookupKey];
        
        if (!translation) {
            const packageInfo = packageName ? ` in package "${packageName}"` : '';
            console.warn(`Missing translation for key "${key}"${packageInfo} for locale "${targetLocale}"`);
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
                options: { locale?: string; package?: string } = {}
            ) {
                const targetLocale = options.locale || i18nService.currentLocale;
                const expectedText = i18nService.get_localized_text(translationKey, targetLocale, options.package);
                
                if (expectedText.startsWith('[MISSING:')) {
                    const packageInfo = options.package ? ` in package "${options.package}"` : '';
                    return {
                        message: () => `Translation key "${translationKey}"${packageInfo} not found for locale "${targetLocale}"`,
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