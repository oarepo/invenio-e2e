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
    blah: number;
}>({
    // locators
    locators,
    // all pages
    availablePages: {} as { [key: string]: BasePage },
    blah: 1,
    // pages
    ...registerPage('homePage', HomePage),
    ...registerPage('searchPage', SearchPage, { extraFixtures: ['blah'] }),
})

export type InvenioTest = typeof test

