import { Expect, Locator, Page, expect } from '@playwright/test';

import type { Locators } from '../locators';
import i18next from 'i18next';

/**
 * Type that adds translation checking methods to Playwright's expect function
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
 * Structure for pre-compiled translations
 */
export interface Translations {
    [locale: string]: {
        [key: string]: string;
    };
}

/**
 * Interface for changing languages and checking translations in tests
 */
export interface I18nServiceInterface<L extends Locators> {
    switchLocale(locale: string): Promise<void>;
    currentLocale: string;
    untranslatedStrings: string[];
    translatableSelectors: string[];
    translations: Translations;
    extendExpect<T extends Record<string, any> = {}>(expect: Expect<T>): Expect<T & I18nExpected>;
    hasTranslation(key: string, locale?: string, packageName?: string): boolean;
    getLocalizedText(key: string, locale?: string, packageName?: string): string;
}

/**
 * Service for handling internationalization (i18n) in E2E tests
 */
export class I18nService<L extends Locators> implements I18nServiceInterface<L> {
    private page: Page;
    private locators: L;
    private currentLocaleValue: string;
    private i18nextInstances: Map<string, typeof i18next> = new Map();
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
        
        this.initializeI18next();
    }

    /**
     * Initialize i18next instances for each locale to handle language nuances
     */
    private async initializeI18next(): Promise<void> {
        for (const locale of Object.keys(this.translations)) {
            const instance = i18next.createInstance();
            await instance.init({
                lng: locale,
                resources: {
                    [locale]: {
                        translation: this.translations[locale]
                    }
                },
                // handle Czech and other slavic language plurals properly
                pluralSeparator: '_',
                contextSeparator: '_',
                interpolation: {
                    escapeValue: false 
                }
            });
            this.i18nextInstances.set(locale, instance);
        }
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

    /**
     * Get localized text using i18next for better language handling.
     * 
     * This method uses i18next to properly handle language nuances, including:
     * - Czech plural forms and cases
     * - Proper interpolation and formatting
     * - Context-sensitive translations
     * 
     * @param key - Translation key to look up
     * @param locale - Locale defaults to current locale
     * @param packageName - Optional package namespace for scoped lookups
     * @returns Translated text or a fallback indicator
     */
    getLocalizedText(key: string, locale?: string, packageName?: string): string {
        const targetLocale = locale || this.currentLocaleValue;
        const lookupKey = packageName ? `${packageName}:${key}` : key;
        
        // Try using i18next instance for better language handling
        const i18nextInstance = this.i18nextInstances.get(targetLocale);
        if (i18nextInstance) {
            try {
                const translation = i18nextInstance.t(lookupKey);
                if (translation && translation !== lookupKey) {
                    return translation;
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.warn(`i18next translation failed for key "${key}":`, error.message);
                }
            }
        }
        
        // Fallback to direct lookup
        const translation = this.translations[targetLocale]?.[lookupKey];
        
        if (translation === undefined) {
            const packageInfo = packageName ? ` in package "${packageName}"` : '';
            console.warn(`Missing translation for key "${key}"${packageInfo} for locale "${targetLocale}"`);
            return `[MISSING: ${key}]`;
        }
        
        return translation.trim() || key;
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
            if (error instanceof Error) {
                console.warn('UI language switching failed, falling back to URL method:', error.message);
            }
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
                const expectedText = i18nService.getLocalizedText(translationKey, targetLocale, options.package);
                
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