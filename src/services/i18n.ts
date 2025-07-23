import { Expect, Locator, Page, expect } from '@playwright/test';

import type { Locators } from '../locators';

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

export interface Translations {
    [catalogue: string]: {
        [locale: string]: {
            [key: string]: string;
        };
    };
}

/**
 * Interface for changing languages and checking translations in tests
 */
export interface I18nServiceInterface<L extends Locators> {
    switchLocale(locale: string): Promise<void>;
    currentLocale: string;
    extendExpect(expect: Expect): Expect<I18nExpected>;
    hasTranslation(key: string, messageCatalogue: string, locale?: string): boolean;
}

export class I18nService<L extends Locators> implements I18nServiceInterface<L> {
    private page: Page;
    private locators: L;
    private _currentLocale: string;
    private translations: Translations;

    constructor(
        page: Page,
        locators: L,
        initialLocale: string = 'en',
        translations: Translations = {}
    ) {
        this.page = page;
        this.locators = locators;
        this._currentLocale = initialLocale;
        this.translations = translations;
        
        if (Object.keys(translations).length === 0) {
            this.translations = this.getDefaultTranslations();
        }
    }

    get currentLocale(): string {
        return this._currentLocale;
    }

    /**
     * Placeholder translations structure matching 
     * 
     * Future catalogue loading ideas:
     * Query installed packages for entry points, generate registry JSON file
     * Runtime query: fetch(`${baseUrl}/api/translations/catalogs`)
     */
    private getDefaultTranslations(): Translations {
        return {
            'test': {
                'en': { 'repository.welcome': 'Welcome to InvenioRDM\'s Sandbox!' },
                'de': { 'repository.welcome': 'Willkommen in InvenioRDMs Sandbox!' },
                'cs': { 'repository.welcome': 'Vítejte v InvenioRDM Sandbox!' }
            },
            // Placeholder catalogue - institutions would provide real translations
            'invenio-app-rdm-messages': {
                'en': { 
                    'repository.name': 'InvenioRDM Repository',
                    'search.placeholder': 'Search records...',
                    'nav.home': 'Home',
                    'nav.search': 'Search'
                },
                'de': { 
                    'repository.name': 'InvenioRDM Repository',
                    'search.placeholder': 'Datensätze suchen...',
                    'nav.home': 'Startseite', 
                    'nav.search': 'Suchen'
                }
            }
        };
    }

    /** Get list of available translation catalogues */
    getAvailableCatalogues(): string[] {
        return Object.keys(this.translations);
    }

    /** Check if translation exists for a key */
    hasTranslation(key: string, messageCatalogue: string, locale?: string): boolean {
        const targetLocale = locale || this._currentLocale;
        return !!(this.translations[messageCatalogue]?.[targetLocale]?.[key]);
    }

    /** Get translated text for a key */
    get_localized_text(key: string, messageCatalogue: string, locale?: string): string {
        const targetLocale = locale || this._currentLocale;
        const translation = this.translations[messageCatalogue]?.[targetLocale]?.[key];
        
        if (!translation) {
            console.warn(`Missing translation for key "${key}" in catalogue "${messageCatalogue}" for locale "${targetLocale}"`);
            return `[MISSING: ${key}]`;
        }
        
        return translation;
    }

    /** Change page language using URL parameter */
    async switchLocale(locale: string): Promise<void> {
        this._currentLocale = locale;

        const url = new URL(this.page.url());
        url.searchParams.set('ln', locale);
        await this.page.goto(url.toString());
        await this.page.waitForLoadState('networkidle');
    }

    /** Add translation checking to Playwright expect */
    extendExpect(expect: Expect): Expect<I18nExpected> {
        const i18nService = this;
        return expect.extend<I18nExpected>({
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
        });
    }
}