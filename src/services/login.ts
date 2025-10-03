import { Page } from '@playwright/test';
import { Locators } from '../locators';
import { Config } from '../config';
import { AllPages, BasePage } from '../pages';

export interface LoginServiceInterface<L extends Locators> {
    isUserLoggedIn: () => Promise<boolean>;
    login<S extends BasePage<L>>(
        currentPage: S,
        credentials?: { username?: string; password?: string },
    ): Promise<S>;
}

export class LocalLoginService<L extends Locators> implements LoginServiceInterface<L> {
    constructor(
        protected config: Config,
        protected page: Page,
        protected locators: L,
        protected availablePages: AllPages<L>,
    ) { }

    async isUserLoggedIn(): Promise<boolean> {
        const loginLink = this.page.locator(this.locators.header.logInButton);
        if (await loginLink.isVisible()) {
            return false; // User is not logged in if the login link is visible
        }
        return true;
    }

    async login<S extends BasePage<L>>(
        currentPage: S,
        credentials?: { username: string, password: string },
    ): Promise<S> {
        const username = credentials?.username || this.config.userEmail;
        const password = credentials?.password || this.config.userPassword;

        const loginPage = this.availablePages.loginPage;
        await loginPage.openPage({ nextURL: this.page.url() });
        return await loginPage.loginUser(username, password, currentPage);
    }
}