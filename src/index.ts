/**
 * Copyright (C) 2024 Graz University of Technology.
 * 
 * invenio-e2e is free software; you can redistribute it and/or
 * modify it under the terms of the ISC License; see LICENSE file for more
 * details.
 */

// test runner
export {test, registerPage} from './fixtures';

// services and i18n
export { createServices, createServiceTest, ServiceHomePage } from './services';
export type { ServiceConfig, Services } from './services';

// i18n expect extensions
export { createI18nExpect } from './fixtures/i18n';
export type { I18nMatcherOptions } from './fixtures/i18n';

// pages
export * from './pages';

// locators
export * from './locators';

// test suites
export * from './tests/e2e';

