// test runner
export {test} from './fixtures';
export type { InvenioTest } from './fixtures';

// default locators
export { BASE_PAGE_LOCATORS, HOME_PAGE_LOCATORS, SEARCH_PAGE_LOCATORS } from "./locators";

// pages
export { HomePage } from './pages/homePage';
export { SearchPage } from './pages/searchPage';
export { BasePage } from './pages/basePage';

// tests
export { homepageTests } from './tests/homepage';