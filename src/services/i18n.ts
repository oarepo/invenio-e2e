import { Page, Expect } from '@playwright/test';
import { Locators } from '../locators';

export interface I18nServiceInterface<L extends Locators> {
    // TODO: Define methods for the I18nServiceInterface
    extendExpect(expect: Expect): Expect;
}

export type I18nExpect = {
    toHaveI18nText: (received: any, text: string) => Promise<{
        pass: boolean;
        message: () => string;
    }>;
};

export class I18nService<L extends Locators> implements I18nServiceInterface<L> {
    constructor(
        protected page: Page,
        protected locators: L) { }
    // methods here
    extendExpect(expect: Expect): Expect<I18nExpect> {
        // todo: add matchers here
        return expect.extend<I18nExpect>({
            toHaveI18nText: async (received: any, text: string) => {
                // TODO: implement this
                return { pass: true, message: () => "" }
            }
        });
    }
}