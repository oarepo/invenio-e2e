import { HomePage } from './homePage';
import { SearchPage } from './searchPage';
import { LoginPage } from './loginPage';
import { DepositPage } from './depositPage';
import { PreviewPage } from './previewPage';
import { CommunitiesPage } from './communitiesPage';
import { CommunityDetailPage } from './communityDetailPage';
import { CommunitySearchPage } from './communitySearchPage';
import { MyDashboardPage } from './myDashboardPage';
import { NewCommunityPage } from './newCommunityPage';

export { BasePage } from './basePage';
export { HomePage } from './homePage';
export { SearchPage } from './searchPage';
export { DepositPage } from './depositPage';
export { PreviewPage } from './previewPage';
export { LoginPage } from './loginPage';
export { CommunitiesPage } from './communitiesPage';
export { CommunityDetailPage } from './communityDetailPage';
export { CommunitySearchPage } from './communitySearchPage';
export { MyDashboardPage } from './myDashboardPage';
export { NewCommunityPage } from './newCommunityPage';



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
    communitiesPage: CommunitiesPage<L>;
    communityDetailPage: CommunityDetailPage<L>;
    communitySearchPage: CommunitySearchPage<L>;
    myDashboardPage: MyDashboardPage<L>;
    newCommunityPage: NewCommunityPage<L>;
}

