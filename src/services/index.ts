/**
 * Copyright (C) 2024 Graz University of Technology.
 * 
 * invenio-e2e is free software; you can redistribute it and/or
 * modify it under the terms of the ISC License; see LICENSE file for more
 * details.
 */

import { Page } from '@playwright/test';
import { test as invenio_test, type InvenioTest } from '../fixtures';
import { updateLocators } from '../locators';
import { HomePage } from '../pages';

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

export interface Services {
  i18n: {
    languages: string[];
    defaultLanguage: string;
    switchLanguage: (page: Page, language: string) => Promise<void>;
    t: (key: string, language?: string) => string;
  };
  repository: {
    name: string;
    url: string;
    goto: (page: Page) => Promise<void>;
  };
}

// Service factory - works for any repository
export const createServices = (config: ServiceConfig): Services => ({
  i18n: {
    languages: config.languages.supported,
    defaultLanguage: config.languages.default,
    switchLanguage: async (page: Page, language: string) => {
      if (!config.languages.supported.includes(language)) {
        throw new Error(`Language ${language} not supported. Available: ${config.languages.supported.join(', ')}`);
      }
      console.log(`[${config.name}] Switching to language: ${language}`);
      // Generic implementation - repositories can override this
      // patterns: URL params, cookies, localStorage, API calls
    },
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

export class ServiceHomePage extends HomePage {
  constructor({ page, locators, availablePages, services }: {
    page: Page,
    locators: any,
    availablePages: { [key: string]: object },
    services: Services
  }) {
    super({ page, locators, availablePages });
    this.services = services;
  }

  protected services: Services;

  async switchLanguage(language: string) {
    if (this.services?.i18n && this.services.i18n.languages.includes(language)) {
      await this.services.i18n.switchLanguage(this.page, language);
    } else {
      console.log(`Language '${language}' not supported by ${this.services.repository.name}`);
    }
  }

  async getLocalizedTitle(): Promise<string> {
    if (this.services?.i18n) {
      return this.services.i18n.t('page.title');
    }
    return await this.page.title();
  }

  // Repository info for services
  getRepositoryInfo() {
    return {
      name: this.services.repository.name,
      supportedLanguages: this.services.i18n.languages,
      defaultLanguage: this.services.i18n.defaultLanguage,
    };
  }
}

export interface ServiceTest extends InvenioTest {
  serviceConfig: ServiceConfig;
  services: Services;
  serviceHomePage: ServiceHomePage;
}

export const createServiceTest = (config: ServiceConfig, customLocators?: any) => {
  return invenio_test.extend<{
    serviceConfig: ServiceConfig;
    services: Services;
    serviceHomePage: ServiceHomePage;
  }>({
    locators: customLocators ? updateLocators(customLocators) : updateLocators({}),

    serviceConfig: async ({}, use) => {
      await use(config);
    },

    services: async ({ serviceConfig }, use) => {
      const services = createServices(serviceConfig);
      await use(services);
    },

    serviceHomePage: async ({ page, locators, availablePages, services }, use) => {
      const serviceHomePage = new ServiceHomePage({ page, locators, availablePages, services });
      await use(serviceHomePage);
    },
  });
}; 