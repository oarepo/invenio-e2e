// test runner
export { test, InvenioTest, registerPage } from './fixtures';

// pages
export { BasePage, HomePage, SearchPage } from './pages';

// locators
export { locators, Locators, updateLocators } from "./locators";

// services
export { 
    I18nService, 
    I18nServiceInterface, 
    I18nExpected, 
    Translations, 
    LocalLoginService, 
    LoginServiceInterface, 
    Services 
} from './services';

// utils
export { TextCaptureUtil, TextCaptureOptions, TranslatableElement } from './utils';

// tests
export { homepageTests } from './tests/e2e';