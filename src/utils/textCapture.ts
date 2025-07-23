import { Locator, Page } from '@playwright/test';

/**
 * configuration options for text capture behavior
 * controls word filtering, patterns, and capture modes
 */
export interface TextCaptureOptions {
    minWordLength?: number;
    wordPattern?: RegExp;
    captureMode?: 'words' | 'chunks';
}

/**
 * represents a UI element that should be translated
 * contains the element locator, text content, and selector information
 */
export interface TranslatableElement {
    locator: Locator;
    text: string;
    selector: string;
}

/**
 * utility class for capturing and analyzing text content from web pages
 */
export class TextCaptureUtil {
  /** 
   * captures all text from page, excluding specified areas
   * chunk capture grabs meaningful text phrases instead of single words
   * now captures things like "Graph Neural Networks" as one piece rather than three separate words
   * added more HTML tags and skips big container elements
   */
  static async capture(
    page: Page,
    excludes: string[] = [],
    options: TextCaptureOptions = {}
  ): Promise<string[]> {
    const { minWordLength = 2, wordPattern = /^[a-zA-ZÀ-ÿ]/, captureMode = 'chunks' } = options;

    return await page.evaluate(
      (args) => {
        const { excludes, minWordLength, wordPattern, captureMode } = args;
        const clone = document.cloneNode(true) as Document;
        const pattern = new RegExp(wordPattern);

        excludes.forEach((selector) => {
          const elements = clone.querySelectorAll(selector);
          for (let i = 0; i < elements.length; i++) {
            elements[i].remove();
          }
        });

        if (captureMode === 'words') {
          const bodyText = clone.body ? clone.body.textContent || "" : "";
          return bodyText
            .split(/\s+/)
            .filter((word) => word.length > minWordLength && pattern.test(word))
            .filter((word, index, arr) => arr.indexOf(word) === index) 
            .sort();
        }

        const chunks = [];
        const meaningfulTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 
                               'section', 'article', 'header', 'footer', 'main', 'aside', 'blockquote',
                               'span', 'a', 'button', 'label', 'legend', 'nav'];
        
        function collectChunks(element) {
          if (!element.textContent) return;
          const text = element.textContent.trim();
          if (!text) return;
          
          const tagName = element.tagName.toLowerCase();
          
          if (['script', 'style', 'noscript', 'meta', 'link'].indexOf(tagName) !== -1) return;
          
           if (meaningfulTags.indexOf(tagName) !== -1) {
             const cleanText = text.replace(/\s+/g, ' ');
             if (cleanText.length > minWordLength && pattern.test(cleanText)) {
               /* only skip if this element has many large block children is just a container */
               let largeBlockChildren = 0;
               for (let i = 0; i < element.children.length; i++) {
                 const child = element.children[i];
                 const childTag = child.tagName.toLowerCase();
                 if (['div', 'section', 'article', 'main'].indexOf(childTag) !== -1 && 
                     (child.textContent || '').length > 100) {
                   largeBlockChildren++;
                 }
               }
                if (largeBlockChildren <= 1) {
                 chunks.push(cleanText);
               }
             }
           }
          
          const children = element.children;
          for (let i = 0; i < children.length; i++) {
            collectChunks(children[i]);
          }
        }

        if (clone.body) {
          const children = clone.body.children;
          for (let i = 0; i < children.length; i++) {
            collectChunks(children[i]);
          }
        }

        // remove duplicates and sort
        const uniqueChunks = [];
        chunks.forEach((chunk) => {
          if (uniqueChunks.indexOf(chunk) === -1) {
            uniqueChunks.push(chunk);
          }
        });
        
        return uniqueChunks.sort();
      },
      { excludes, minWordLength, wordPattern: wordPattern.source, captureMode }
    );
  }

  /**
   * finds specific UI elements that should have translations
   * searches for elements using provided selectors and excludes areas that don't need translation
   */
  static async findTranslatableElements(
    page: Page,
    excludes: string[] = [],
    translatableSelectors: string[] = []
  ): Promise<TranslatableElement[]> {

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