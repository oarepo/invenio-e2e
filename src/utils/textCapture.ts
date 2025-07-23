import { Locator, Page } from '@playwright/test';

export interface TextCaptureOptions {
    minWordLength?: number;
    wordPattern?: RegExp;
}

export interface TranslatableElement {
    locator: Locator;
    text: string;
    selector: string;
}

export class TextCaptureUtil {
  /** Get all text from page, excluding specified areas */
  static async capture(
    page: Page,
    excludes: string[] = [],
    options: TextCaptureOptions = {}
  ): Promise<string[]> {
    const { minWordLength = 2, wordPattern = /^[a-zA-ZÀ-ÿ]/ } = options;

    return await page.evaluate(
      (args) => {
        const { excludes, minWordLength, wordPattern } = args;
        const clone = document.cloneNode(true) as Document;

        excludes.forEach((selector) => {
          const elements = clone.querySelectorAll(selector);
          elements.forEach((el) => el.remove());
        });

        const allText = clone.body?.textContent || "";
        const pattern = new RegExp(wordPattern);

        return allText
          .split(/\s+/)
          .filter((word) => word.length > minWordLength && pattern.test(word))
          .filter((word, index, arr) => arr.indexOf(word) === index) 
          .sort();
      },
      {
        excludes,
        minWordLength,
        wordPattern: wordPattern.source,
      }
    );
  }

  /** Find specific UI elements that should have translations */
  static async findTranslatableElements(
    page: Page,
    excludes: string[] = []
  ): Promise<TranslatableElement[]> {
    const translatableSelectors = [
      "nav a:not(:empty)",
      "nav button:not(:empty)",
      "nav span:not(:empty)",
      ".navbar a:not(:empty)",
      ".navbar button:not(:empty)",
      ".navbar span:not(:empty)",
      "header a:not(:empty)",
      "header button:not(:empty)",
      "header span:not(:empty)",

      "label:not(:empty)",
      ".form-label:not(:empty)",
      "legend:not(:empty)",
      "button:not(:empty)",
      'input[type="submit"][value]',

      "h1:not(:empty)",
      "h2:not(:empty)",
      "h3:not(:empty)",
      "h4:not(:empty)",
      "h5:not(:empty)",
      "h6:not(:empty)",
      ".alert:not(:empty)",
      ".error:not(:empty)",
      ".warning:not(:empty)",
      ".success:not(:empty)",
      ".help-text:not(:empty)",
      ".tooltip:not(:empty)",

      '[role="menuitem"]:not(:empty)',
      '[role="tab"]:not(:empty)',
      '[role="button"]:not(:empty)',
      ".menu-item:not(:empty)",
      ".tab-label:not(:empty)",
      ".btn:not(:empty)",
    ];

    const elements: TranslatableElement[] = [];

    for (const selector of translatableSelectors) {
      const locators = page.locator(selector);
      const count = await locators.count();

      for (let i = 0; i < count; i++) {
        const locator = locators.nth(i);

        let isInExcludedArea = false;
        for (const excludeSelector of excludes) {
          const parentCheck = await locator
            .locator(
              `xpath=ancestor-or-self::*[contains(@class, "${excludeSelector.replace(
                ".",
                ""
              )}")][1]`
            )
            .count();
          if (parentCheck > 0) {
            isInExcludedArea = true;
            break;
          }
        }

        if (!isInExcludedArea && (await locator.isVisible())) {
          const text = ((await locator.textContent()) || "").trim();
          if (text.length > 0) {
            elements.push({
              locator,
              text,
              selector: `${selector}:nth-child(${i + 1})`,
            });
          }
        }
      }
    }
    return elements;
  }
} 