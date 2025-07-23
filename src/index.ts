// test runner
export * from './fixtures';
export * from './pages';
export * from './locators';
export * from './services';
export * from './utils';

// default locators
export { locators, Locators, updateLocators } from "./locators";

// pages
export { HomePage } from './pages/homePage';
export { SearchPage } from './pages/searchPage';
export { BasePage } from './pages/basePage';

// tests
export { homepageTests } from './tests/e2e';