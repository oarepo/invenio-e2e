import { BasePage, HomePage, SearchPage } from '../pages';
import { Expect, test as base, expect as playwrightExpect } from '@playwright/test';
import { I18nExpected, I18nService, LocalLoginService, Services, Translations } from '../services';

import type { Locators } from '../locators';
import { TextCaptureOptions } from '../utils/textCapture';
import { locators } from '../locators';
import { registerPage } from './utils';

export { registerPage } from './utils';

export const test = base.extend<{
    locators: Locators;
    availablePages: { [key: string]: object };

    initialLocale: string;
    translations: Translations;
    excludes: string[];
    translatableSelectors: string[];

    i18nService: I18nService<Locators>;
    loginService: LocalLoginService<Locators>;

    services: Services<Locators>;

    expect: Expect<I18nExpected>;

    homePage: HomePage;
    searchPage: SearchPage;

}>({
    // locators are used to find elements on the page and they are separated
    // from the page classes so that they can be easily overwritten in tests
    // for different invenio flavours/instances.
    locators,

    // registry of all available pages. Page gets this registry in the constructor
    // so it can navigate to other pages (for example, HomePage.submitSearch) will
    // use this registry to navigate to the SearchPage.
    availablePages: {} as { [key: string]: BasePage },

    // initial locale (do not limit the locale by default)
    initialLocale: undefined,

    // translations for i18n service with sensible defaults
    translations: {
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
    },

    // excludes for translation testing 
    excludes: [],

    // selectors for elements that should be translatable
    translatableSelectors: [
        "nav a:not(:empty)",
        "nav button:not(:empty)",
        "nav span:not(:empty)",
        ".navbar a:not(:empty)",
        ".navbar button:not(:empty)",
        ".navbar span:not(:empty)",
        "header a:not(:empty)",
        "header button:not(:empty)",
        "header span:not(:empty)",

        "label:not(:empty)",
        ".form-label:not(:empty)",
        "legend:not(:empty)",
        "button:not(:empty)",
        'input[type="submit"][value]',

        "h1:not(:empty)",
        "h2:not(:empty)",
        "h3:not(:empty)",
        "h4:not(:empty)",
        "h5:not(:empty)",
        "h6:not(:empty)",
        ".alert:not(:empty)",
        ".error:not(:empty)",
        ".warning:not(:empty)",
        ".success:not(:empty)",
        ".help-text:not(:empty)",
        ".tooltip:not(:empty)",

        '[role="menuitem"]:not(:empty)',
        '[role="tab"]:not(:empty)',
        '[role="button"]:not(:empty)',
        ".menu-item:not(:empty)",
        ".tab-label:not(:empty)",
        ".btn:not(:empty)",
    ],

    // browser context with initial locale
    context: async ({ context: originalContext, initialLocale }, use) => {
        if (initialLocale) {
            // Set Accept-Language header to simulate browser locale preference
            await originalContext.setExtraHTTPHeaders({ "Accept-Language": initialLocale });
        }
        await use(originalContext);
    },

    i18nService: async ({ page, locators, initialLocale, translations, excludes, translatableSelectors }, use) => {
        const i18nService = new I18nService(page, locators, initialLocale, translations, excludes, translatableSelectors);
        await use(i18nService);
    },

    loginService: async ({ page, locators }, use) => {
        const loginService = new LocalLoginService(page, locators);
        await use(loginService);
    },

    services: async ({ i18nService, loginService }, use) => {
        // services are used to interact with the application, for example,
        // loginService is used to log in the user, i18nService is used to
        // interact with the internationalization service.
        await use({ i18n: i18nService, login: loginService });
    },

    expect: async ({ i18nService }, use) => {
        // serviceA.extendExpected(serviceB.extendExpected(playwrightExpected))
        await use(i18nService.extendExpect(playwrightExpect));
    },

    // pages provide a set of methods to interact with a UI page, abstracting low-level
    // Playwright API calls. They are registered in the availablePages registry
    // so that they can be easily accessed from other pages and tests.
    ...registerPage('homePage', HomePage),
    ...registerPage('searchPage', SearchPage),

})

export type InvenioTest = typeof test

