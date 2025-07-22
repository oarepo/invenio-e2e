/**
 * Copyright (C) 2024 Graz University of Technology.
 * 
 * invenio-e2e is free software; you can redistribute it and/or
 * modify it under the terms of the ISC License; see LICENSE file for more
 * details.
 */

import { Page } from '@playwright/test';
import { test as invenio_test, type InvenioTest } from '../fixtures';
import { updateLocators, type Locators } from '../locators';
import { HomePage } from '../pages';
import { createI18nExpect } from '../fixtures/i18n';

/**
 * Config for repository services like translations and locators.
 */
export interface ServiceConfig {
  name: string;
  url: string;
  languages: {
    supported: string[];
    default: string;
  };
  translations: Record<string, Record<string, string>>;
  locators?: Record<string, any>;
}

/**
 * Services for i18n and repository navigation.
 */
export interface Services {
  i18n: {
    languages: string[];
    defaultLanguage: string;
    t: (key: string, language?: string) => string;
  };
  repository: {
    name: string;
    url: string;
    goto: (page: Page) => Promise<void>;
  };
}

/**
 * Creates services from repository config.
 * 
 * @param config Repository config
 * @returns Services with i18n and repository functions
 */
export const createServices = (config: ServiceConfig): Services => ({
  i18n: {
    languages: config.languages.supported,
    defaultLanguage: config.languages.default,
    t: (key: string, language?: string) => {
      const lang = language || config.languages.default;
      return config.translations[lang]?.[key] || `[${key}]`;
    },
  },
  repository: {
    name: config.name,
    url: config.url,
    goto: async (page: Page) => {
      await page.goto(config.url);
    },
  },
});

/**
 * Homepage with language switching support.
 */
export class ServiceHomePage<L extends Locators = Locators> extends HomePage<L> {
  constructor({ page, locators, availablePages, services }: {
    page: Page,
    locators: L,
    availablePages: { [key: string]: object },
    services: Services
  }) {
    super({ page, locators, availablePages });
    this.services = services;
  }

  protected services: Services;

  /** Get page title in current language */
  async getLocalizedTitle(): Promise<string> {
    if (this.services?.i18n) {
      return this.services.i18n.t('page.title');
    }
    return await this.page.title();
  }

  /** Get repository info */
  getRepositoryInfo() {
    return {
      name: this.services.repository.name,
      supportedLanguages: this.services.i18n.languages,
      defaultLanguage: this.services.i18n.defaultLanguage,
    };
  }
}

export interface ServiceTest<L extends Locators = Locators> extends InvenioTest {
  serviceConfig: ServiceConfig;
  services: Services;
  serviceHomePage: ServiceHomePage<L>;
}

/**
 * Creates test with services and i18n fixtures.
 * 
 * @example
 * const test = createServiceTest(config);
 * test('check translation', async ({ expect, page }) => {
 *   await expect(page.locator('#title')).toHaveI18nText("Welcome", "messages", { locale: "de" });
 * });
 */
export const createServiceTest = <L extends Locators = Locators>(config: ServiceConfig, customLocators?: L) => {
  return invenio_test.extend<{
    serviceConfig: ServiceConfig;
    services: Services;
    serviceHomePage: ServiceHomePage<L>;
    expect: ReturnType<typeof createI18nExpect<Services>>;
  }>({
    locators: customLocators ? updateLocators(customLocators) : updateLocators({}),

    serviceConfig: async ({}, use) => {
      await use(config);
    },

    services: async ({ serviceConfig }, use) => {
      const services = createServices(serviceConfig);
      await use(services);
    },

    expect: async ({ services }, use) => {
      const customExpect = createI18nExpect(services);
      await use(customExpect);
    },

    serviceHomePage: async ({ page, locators, availablePages, services }, use) => {
      const serviceHomePage = new ServiceHomePage<L>({ page, locators: locators as L, availablePages, services });
      await use(serviceHomePage);
    },
  });
}; 