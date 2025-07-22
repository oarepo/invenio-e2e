import { Expect, test as base, expect as playwrightExpect } from '@playwright/test';
import { I18nExpect, I18nService, LocalLoginService, Services } from '../services';

import { locators } from '../locators';
import { registerPage } from './utils';
export { registerPage } from './utils';


export const test = base.extend<{
    locators: Locators;
    availablePages: { [key: string]: object };

    initialLocale: string;

    i18nService: I18nService<Locators>;
    loginService: LocalLoginService<Locators>;

    services: Services<Locators>;

    expect: Expect<I18nExpect>;

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

    // browser context with initial locale
    context: async ({ context: originalContext, initialLocale }, use) => {
        if (initialLocale) {
            // TODO: will this work???
            await originalContext.setExtraHTTPHeaders({ "Accept-Language": initialLocale });
        }
        await use(originalContext);
    },

    i18nService: async ({ page, locators }, use) => {
        const i18nService = new I18nService(page, locators);
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
        // TODO: find a type safe way to extend the expect multiple times
        await use(i18nService.extendExpect(playwrightExpect));
    },

    // pages provide a set of methods to interact with a UI page, abstracting low-level
    // Playwright API calls. They are registered in the availablePages registry
    // so that they can be easily accessed from other pages and tests.
    ...registerPage('homePage', HomePage),
    ...registerPage('searchPage', SearchPage),
})

export type InvenioTest = typeof test;

