import { Page } from '@playwright/test';
import type { Locators } from '../locators';
import { BasePage } from '../pages';

export type PageFixtureParams<L extends Locators> = {
    page: Page;
    locators: L;
    availablePages: { [key: string]: object };
}

export type UseFunction<L extends Locators, T extends typeof BasePage<L>> = (r: InstanceType<T>) => Promise<void>;

export function registerPage<
    L extends Locators,
    T extends typeof BasePage<L>
>(name: string, PageType: T): { [key: string]: (params: PageFixtureParams<L>, use: UseFunction<L, T>) => Promise<void> } {
    return {
        [name]: async ({ page, locators, availablePages }: PageFixtureParams<L>, use: UseFunction<L, T>) => {
            const pageInstance = new PageType(page, locators, availablePages);
            availablePages[name] = pageInstance;
            await use(pageInstance as InstanceType<T>);
        }
    }
}
