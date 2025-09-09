// test runner
export {test, registerPage} from './fixtures';
export type { InvenioTest } from './fixtures';

// default locators
export { locators, Locators, updateLocators } from "./locators";

// pages
export { HomePage } from './pages/homePage';
export { SearchPage } from './pages/searchPage';
export { BasePage } from './pages/basePage';
export { DepositPage } from './pages/depositPage';

// tests
export { homepageTests } from './tests/e2e';
export { uploadTests } from './tests/e2e/upload';
