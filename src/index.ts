/**
 * Copyright (C) 2024 Graz University of Technology.
 * 
 * invenio-e2e is free software; you can redistribute it and/or
 * modify it under the terms of the ISC License; see LICENSE file for more
 * details.
 */

// test runner
export {test, registerPage} from './fixtures';
export type { InvenioTest } from './fixtures';

// default locators
export { locators, Locators, updateLocators } from './locators';

// pages
export { HomePage } from './pages/homePage';
export { SearchPage } from './pages/searchPage';
export { BasePage } from './pages/basePage';

// tests
export { homepageTests } from './tests/e2e';

// services
export { createServices, createServiceTest, ServiceHomePage } from './services';
export type { ServiceConfig, Services, ServiceTest } from './services';

