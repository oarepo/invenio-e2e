import { test as base, expect as playwrightExpect, Expect } from '@playwright/test';
import { locators } from '../locators';
import type { Locators } from '../locators';
import { AllPages, HomePage, SearchPage, BasePage, LoginPage } from '../pages';
import { registerPage } from './utils';
export { registerPage } from './utils';
import { LocalLoginService, I18nService, Services, I18nExpect } from '../services';
import { config } from '../config';
import type { Config } from '../config';


const _test = base.extend<{
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

type _invenio_base_test = typeof _test;

/*
 * Support for skipping tests based on a list of skipped tests.
 * As we can not replace the test implementation, we use a Proxy to intercept
 * the calls to the test object and skip tests based on the skipped tests list.
 * 
 * To be type safe, we extend the base test type with our own InvenioTest type.
 */
export interface InvenioTest extends _invenio_base_test {
    __skipped_tests?: string[];
    /**
     * Call the callback function with the skipped tests list. If a test inside the callback
     * has a title that is in the skipped tests list, it will be skipped.
     * 
     * @param skippedTests  a list of test titles to skip
     * @param callback      a callback function that contains the tests to run
     */
    skipTests: (skippedTests: string[], callback: () => void) => void;
}

/**
 * InvenioTest is a normal Playwright test object with additional functionality
 * to skip tests based on a list of skipped tests.
 */
export const test = new Proxy(_test as InvenioTest, {

    /**
     * Proxy getter to handle .describe and .skipTests methods.
     */
    get: (target, prop) => {
        switch (prop) {
            case 'describe':
                // return a wrapper around the describe method that can skip tests
                return (title: string, annotation?: any, callback?: () => void) => {
                    const skippedTests = target.__skipped_tests || [];
                    if (skippedTests.includes(title)) {
                        return target.describe.skip(title, annotation, callback);
                    } else {
                        return target.describe(title, annotation, callback);
                    }
                }
            case 'skipTests':
                // implementation of the skipTests method. If this method is nested,
                // the skip list will be extended with the new skipped tests for the
                // duration of the callback function and restored after the callback.
                return (skippedTests: string[], callback: () => void) => {
                    // save the original skipped tests list
                    const originalSkippedTests = target.__skipped_tests || [];
                    target.__skipped_tests = skippedTests.concat(originalSkippedTests);
                    try {
                        // run the test inside the callback
                        callback();
                    } finally {
                        // Restore the original skipped tests list
                        target.__skipped_tests = originalSkippedTests;
                    }
                }
            default:
                return target[prop];
        }
    },
    /**
     * Handles the case test("test title", ({fixtures}) => { test body })
     * If the test has a title that is in the skipped tests list, the test
     * will be marked as .skip
     */
    apply: (target, thisArg, args) => {
        const skippedTests = target.__skipped_tests || [];
        // if the first argument is a string, it is a test title
        if (typeof args[0] === 'string' && skippedTests.includes(args[0])) {
            // skip the test if it is in the skipped tests list
            // @ts-ignore
            return target.skip(...args);
        }
        return target.apply(thisArg, args);
    }
});

