import { test as base, expect as playwrightExpect, Expect } from '@playwright/test';
import { locators } from '../locators';
import type { Locators } from '../locators';
import { AllPages, HomePage, SearchPage, BasePage, LoginPage } from '../pages';
import { registerPage } from './utils';
export { registerPage } from './utils';
import { LocalLoginService, I18nService, Services, I18nExpect } from '../services';
import { config } from '../config';
import type { Config } from '../config';


export const test = base.extend<{
    config: Config;
    locators: Locators;
    availablePages: AllPages<Locators>;

    initialLocale: string;

    i18nService: I18nService<Locators>;
    loginService: LocalLoginService<Locators>;
    defaultUserLoggedIn: () => Promise<void>;

    services: Services<Locators>;

    expect: Expect<I18nExpect>;

    homePage: HomePage;
    searchPage: SearchPage;
    loginPage: LoginPage;

}>({
    // locators are used to find elements on the page and they are separated
    // from the page classes so that they can be easily overwritten in tests
    // for different invenio flavours/instances.
    locators,

    // registry of all available pages. Page gets this registry in the constructor
    // so it can navigate to other pages (for example, HomePage.submitSearch) will
    // use this registry to navigate to the SearchPage.
    availablePages: {} as AllPages,

    // initial locale (do not limit the locale by default)
    initialLocale: undefined,

    config,

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

    loginService: async ({ config, page, locators, availablePages }, use) => {
        const loginService = new LocalLoginService(config, page, locators, availablePages);
        await use(loginService);
    },

    defaultUserLoggedIn: async ({ loginService, homePage, loginPage }, use) => {
        // this fixture logs in the default user
        await homePage.openPage();
        await loginService.login(homePage);
        await use(undefined);
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
    ...registerPage("loginPage", LoginPage),
})

export type InvenioTest = typeof test

