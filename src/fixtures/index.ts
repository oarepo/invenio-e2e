/* eslint-disable no-empty-pattern */
import { Expect, test as base, expect as playwrightExpect } from '@playwright/test';
import type { TestDetails } from '@playwright/test';

import { AllPages, HomePage, LoginPage, SearchPage, DepositPage, PreviewPage, CommunitiesPage, CommunityDetailPage, CommunitySearchPage, MyDashboardPage, NewCommunityPage, RecordDetailPage, AdministrationPage, } from '../pages';
import {
    I18nExpected, I18nService, LocalLoginService, Services, Translations, FormService,
} from '../services';

import { defaultDepositionData, DepositionData } from './depositionData';
import { defaultCommunityData, CommunityData } from './communityData';
import { defaultRecordsApiData, RecordsApiData } from './api';

import type { TestConfig } from '../config';
import type { Locators } from '../locators';
import { testConfig } from '../config';
import { locators } from '../locators';
import { registerPage } from './utils';
import { FileUploadHelper } from '../helpers/fileUploadHelper';

export { registerPage } from './utils';
export type { DepositionData, FormData } from './depositionData';
export type { CommunityData, CommunityDataRecord } from './communityData';


const _test = base.extend<{
    config: TestConfig;
    locators: Locators;
    availablePages: AllPages<Locators>;

    initialLocale: string;
    translations: Translations;
    untranslatedStrings: string[];
    translatableSelectors: string[];

    i18nService: I18nService<Locators>;
    loginService: LocalLoginService<Locators>;
    defaultUserLoggedIn: true;
    formService: FormService;
    services: Services<Locators>;

    communityData: CommunityData;
    depositionData: DepositionData;
    recordsApiData: RecordsApiData;

    expect: Expect<I18nExpected>;

    homePage: HomePage;
    searchPage: SearchPage;
    loginPage: LoginPage;
    communitiesPage: CommunitiesPage;
    communityDetailPage: CommunityDetailPage;
    communitySearchPage: CommunitySearchPage;
    myDashboardPage: MyDashboardPage;
    newCommunityPage: NewCommunityPage;
    depositPage: DepositPage;
    previewPage: PreviewPage;
    recordDetailPage: RecordDetailPage;
    administrationPage: AdministrationPage;

    uploadHelper: FileUploadHelper;
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

    // translations loaded from pre-compiled file
    translations: async ({}, use) => {
        let translations: Translations = {};
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports -- we cannot use import here because "@collected-translations" alias is registered when Playwright is run inside an external/tested repository
            const translationsFile = require('@collected-translations/translations.json') as Translations;
            translations = translationsFile;
        } catch {
            throw new Error(
                'Pre-compiled translations not found. Please generate translations first:\n\n' +
                'run: npm run collect-translations\n' +
                'or specify packages: npm run collect-translations invenio-app-rdm repository-tugraz\n' +
                'then rebuild: npm run build\n\n' +
                'this will create src/translations/translations.json with actual translations from your Invenio packages.\n'
            );
        }
        await use(translations);
    },

    // untranslated strings for translation testing 
    untranslatedStrings: [],

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

    config: testConfig,

    // browser context with initial locale
    context: async ({ context: originalContext, initialLocale }, use) => {
        if (initialLocale) {
            // TODO: will this work???
            await originalContext.setExtraHTTPHeaders({ "Accept-Language": initialLocale });
        }
        await use(originalContext);
    },

    i18nService: async ({ page, locators, initialLocale, translations, untranslatedStrings, translatableSelectors }, use) => {
        const i18nService = new I18nService(page, locators, initialLocale, translations, untranslatedStrings, translatableSelectors);
        await use(i18nService);
    },

    loginService: async ({ config, page, locators, availablePages }, use) => {
        const loginService = new LocalLoginService(config, page, locators, availablePages);
        await use(loginService);
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    defaultUserLoggedIn: async ({ loginService, homePage, loginPage }, use) => {
        // this fixture logs in the default user
        await homePage.openPage();
        await loginService.login(homePage);
        await use(true);
    },

    communityData: async ({}, use) => {
        await use(defaultCommunityData);
    },

    depositionData: async ({}, use) => {
        await use(defaultDepositionData);
    },

    recordsApiData: async ({}, use) => {
        await use(defaultRecordsApiData);
    },

    formService: async ({ config }, use) => {
        const formService = new FormService(config);
        await use(formService);
    },

    services: async ({ i18nService, loginService, formService }, use) => {
        // services are used to interact with the application, for example,
        // loginService is used to log in the user, i18nService is used to
        // interact with the internationalization service.
        await use({ i18n: i18nService, login: loginService, form: formService });
    },

    expect: async ({ i18nService }, use) => {
        // TODO: find a type safe way to extend the expect multiple times
        await use(i18nService.extendExpect(playwrightExpect));
    },

    uploadHelper: async ({ page }, use) => {
        const helper = new FileUploadHelper(page);
        await use(helper);
    },

    // pages provide a set of methods to interact with a UI page, abstracting low-level
    // Playwright API calls. They are registered in the availablePages registry
    // so that they can be easily accessed from other pages and tests.
    ...registerPage('homePage', HomePage),
    ...registerPage('searchPage', SearchPage),
    ...registerPage('depositPage', DepositPage),
    ...registerPage('previewPage', PreviewPage),
    ...registerPage("loginPage", LoginPage),
    ...registerPage("communitiesPage", CommunitiesPage),
    ...registerPage("communityDetailPage", CommunityDetailPage),
    ...registerPage("communitySearchPage", CommunitySearchPage),
    ...registerPage("myDashboardPage", MyDashboardPage),
    ...registerPage("newCommunityPage", NewCommunityPage),
    ...registerPage("recordDetailPage", RecordDetailPage),
    ...registerPage("administrationPage", AdministrationPage),
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
     * @param skippedTests a list of test titles to skip
     * @param callback a callback function that contains the tests to run
     */
    skipTests: (skippedTests: string[], callback: () => void) => void;
}

/**
 * InvenioTest is a normal Playwright test object with additional functionality
 * to skip tests based on a list of skipped tests.
 * @augments _test
 * @see {@link https://playwright.dev/docs/api/class-test} for more information about the Playwright test object.
 */
export const test: InvenioTest = new Proxy(_test as InvenioTest, {

    /**
     * Proxy getter to handle .describe and .skipTests methods.
     */
    get: (target, prop: keyof InvenioTest) => {
        switch (prop) {
            case 'describe':
                // return a wrapper around the describe method that can skip tests
                return (title: string, details?: TestDetails, callback?: () => void) => {
                    const skippedTests = target.__skipped_tests || [];
                    if (skippedTests.includes(title)) {
                        return target.describe.skip(title, details as TestDetails, callback || (() => { }));
                    } else {
                        return target.describe(title, details as TestDetails, callback || (() => { }));
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
     * Handles the case test("test title", ({fixtures}) => { test body }).
     * If the test has a title that is in the skipped tests list, the test
     * will be marked as .skip.
     */
    apply: (target, thisArg, args: Parameters<InvenioTest>) => {
        const skippedTests = target.__skipped_tests || [];
        // if the first argument is a string, it is a test title
        if (typeof args[0] === 'string' && skippedTests.includes(args[0])) {
            // skip the test if it is in the skipped tests list
            // @ts-expect-error - Skip method not properly typed on test function
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
            return (target as unknown).skip(...args);
        }
        return target.apply(thisArg, args);
    }
});