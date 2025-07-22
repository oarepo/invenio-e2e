/**
 * Copyright (C) 2024 Graz University of Technology.
 * 
 * invenio-e2e is free software; you can redistribute it and/or
 * modify it under the terms of the ISC License; see LICENSE file for more
 * details.
 */

import { Locator, expect as baseExpected } from '@playwright/test';

import type { Services } from '../services';

export interface I18nMatcherOptions {
  locale?: string;
  timeout?: number;
}

/**
 * Custom expect with i18n matchers.
 * 
 * @example
 * await expect(repositoryName).toHaveI18nText(
 *   "Repository Name",
 *   "invenio-app-rdm-messages", 
 *   { locale: "de" }
 * );
 */
export function createI18nExpect<S extends Services = Services>(services?: S) {
  return baseExpected.extend({
    async toHaveI18nText(locator: Locator, englishText: string, namespace: string, options: I18nMatcherOptions = {}) {
      const { locale, timeout = 5000 } = options;
      
      if (!services) {
        await baseExpected(locator).toHaveText(englishText, { timeout });
        return;
      }

      const targetLocale = locale || services.i18n.defaultLanguage;
      const translationKey = createTranslationKey(englishText);
      const expectedText = services.i18n.t(translationKey, targetLocale);
      
      const finalExpectedText = expectedText.startsWith('[') && expectedText.endsWith(']') 
        ? englishText 
        : expectedText;

      try {
        await baseExpected(locator).toHaveText(finalExpectedText, { timeout });
        return {
          message: () => `Expected "${finalExpectedText}" (${targetLocale})`,
          pass: true,
        };
      } catch (error) {
        const actualText = await locator.textContent();
        return {
          message: () => [
            `Expected i18n text "${finalExpectedText}" (${targetLocale})`,
            `  Expected: "${finalExpectedText}"`,
            `  Received: "${actualText}"`,
          ].join('\n'),
          pass: false,
        };
      }
    },
  });
}

/**
 * English text to translation key.
 */
function createTranslationKey(englishText: string): string {
  return englishText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.');
}

export { expect as baseExpect } from '@playwright/test'; 