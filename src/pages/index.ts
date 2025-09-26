import { HomePage } from './homePage';
import { SearchPage } from './searchPage';
import { LoginPage } from './loginPage';
import { RecordDetailPage } from './recordDetailPage';


export { BasePage } from './basePage';
export { HomePage } from './homePage';
export { SearchPage } from './searchPage';
export { LoginPage } from './loginPage';
export { RecordDetailPage } from './recordDetailPage';

import { Locators } from '../locators';

/**
 * Interface representing all available pages in the application.
 */
export interface AllPages<L extends Locators = Locators> {
    homePage: HomePage<L>;
    searchPage: SearchPage<L>;
    loginPage: LoginPage<L>;
    recordDetailPage: RecordDetailPage<L>;
}

