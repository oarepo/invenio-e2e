import {test as base} from '@playwright/test';
import { BASE_PAGE_LOCATORS, HOME_PAGE_LOCATORS, SEARCH_PAGE_LOCATORS } from '../locators';
import { HomePage } from '../pages/homePage';
import { SearchPage } from '../pages/searchPage';


export const test = base.extend<{
    homePageLocators: typeof HOME_PAGE_LOCATORS;
    searchPageLocators: typeof SEARCH_PAGE_LOCATORS;
    basePageLocators: typeof BASE_PAGE_LOCATORS;
    availablePages: {[key: string]: object};
    homePage: HomePage;
    searchPage: SearchPage;
}>({
    // locators
    homePageLocators: async ({}, use) => {
        await use(HOME_PAGE_LOCATORS);
    },
    searchPageLocators: async ({}, use) => {
        await use(SEARCH_PAGE_LOCATORS);
    },
    basePageLocators: async ({}, use) => {
        await use(BASE_PAGE_LOCATORS);
    },
    // all pages
    availablePages: async ({}, use) => {
        const availablePages: {[key: string]: object} = {}
        await use(availablePages);
    },
    // pages
    homePage: async ({ page, basePageLocators, homePageLocators, availablePages }, use) => {
        const homePage = new HomePage(page, basePageLocators, homePageLocators, availablePages);
        availablePages['homePage'] = homePage;
        await use(homePage);
    },
    searchPage: async ({ page, basePageLocators, searchPageLocators, availablePages }, use) => {
        const searchPage = new SearchPage(page, basePageLocators, searchPageLocators, availablePages);
        availablePages['searchPage'] = searchPage;
        await use(searchPage);
    }
})

export type InvenioTest = typeof test

