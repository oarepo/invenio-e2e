import { Page } from '@playwright/test';
import { Locators } from '../locators';

export interface LoginServiceInterface<L extends Locators> {
    isUserLoggedIn: boolean;
    login(username: string, password: string): Promise<void>;
}

export class LocalLoginService<L extends Locators> implements LoginServiceInterface<L> {
    constructor(
        protected page: Page,
        protected locators: L) { }
    // methods here
    get isUserLoggedIn(): boolean {
        return false;
    }
    async login(username: string, password: string): Promise<void> {
    }
}