import { test as base } from '@playwright/test';
import { locators } from '../locators';
import type { Locators } from '../locators';
import { HomePage, SearchPage, BasePage } from '../pages';
import { registerPage } from './utils';
export { registerPage } from './utils';

export const test = base.extend<{
    locators: Locators;
    availablePages: { [key: string]: object };
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

    // pages provide a set of methods to interact with a UI page, abstracting low-level
    // Playwright API calls. They are registered in the availablePages registry
    // so that they can be easily accessed from other pages and tests.
    ...registerPage('homePage', HomePage),
    ...registerPage('searchPage', SearchPage),
})

export type InvenioTest = typeof test

