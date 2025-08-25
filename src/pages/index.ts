import { HomePage } from './homePage';
import { SearchPage } from './searchPage';
import { LoginPage } from './loginPage';
import { DepositPage } from './depositPage';
import { PreviewPage } from './previewPage';


export { BasePage } from './basePage';
export { HomePage } from './homePage';
export { SearchPage } from './searchPage';
export { DepositPage } from './depositPage';
export { PreviewPage } from './previewPage';
export { LoginPage } from './loginPage';
export { DepositPage } from './depositPage';
export { PreviewPage } from './previewPage';


import { Locators } from '../locators';

/**
 * Interface representing all available pages in the application.
 */
export interface AllPages<L extends Locators = Locators> {
    homePage: HomePage<L>;
    searchPage: SearchPage<L>;
    loginPage: LoginPage<L>;
    depositPage: DepositPage<L>;
    previewPage: PreviewPage<L>; 
}

