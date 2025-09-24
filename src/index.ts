// test runner
export { test, registerPage } from "./fixtures";
export type { InvenioTest } from "./fixtures";

// default locators
export { locators, Locators, updateLocators } from "./locators";

// pages
export { HomePage, SearchPage, BasePage, LoginPage } from "./pages";
export type { AllPages } from "./pages";

// tests
export { homepageTests, loginTests } from "./tests/e2e";

export { i18nValidationTests } from "./tests/i18n/validation.spec";
export { i18nPOTTests } from "./tests/i18n/pot.spec";
