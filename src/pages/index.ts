import { Locators } from "../locators";
import { AdministrationPage } from "./administrationPage";
import { CommunitiesPage } from "./communitiesPage";
import { CommunityDetailPage } from "./communityDetailPage";
import { CommunitySearchPage } from "./communitySearchPage";
import { DepositPage } from "./depositPage";
import { HomePage } from "./homePage";
import { LoginPage } from "./loginPage";
import { MyDashboardPage } from "./myDashboardPage";
import { NewCommunityPage } from "./newCommunityPage";
import { PreviewPage } from "./previewPage";
import { RecordDetailPage } from "./recordDetailPage";
import { SearchPage } from "./searchPage";

/**
 * Re-export the core and specific pages of the application.
 * Allows convenient import of pages from a single location.
 */
export { BasePage } from "./basePage";
export { HomePage } from "./homePage";
export { SearchPage } from "./searchPage";
export { DepositPage } from "./depositPage";
export { PreviewPage } from "./previewPage";
export { LoginPage } from "./loginPage";
export { CommunitiesPage } from "./communitiesPage";
export { CommunityDetailPage } from "./communityDetailPage";
export { CommunitySearchPage } from "./communitySearchPage";
export { MyDashboardPage } from "./myDashboardPage";
export { NewCommunityPage } from "./newCommunityPage";
export { RecordDetailPage } from "./recordDetailPage";
export { AdministrationPage } from "./administrationPage";

/**
 * Interface representing all available pages in the application.
 * Provides type safety and clear structure for page objects.
 */
export interface AllPages<L extends Locators = Locators> {
  homePage: HomePage<L>;
  searchPage: SearchPage<L>;
  loginPage: LoginPage<L>;
  communitiesPage: CommunitiesPage<L>;
  communityDetailPage: CommunityDetailPage<L>;
  communitySearchPage: CommunitySearchPage<L>;
  myDashboardPage: MyDashboardPage<L>;
  newCommunityPage: NewCommunityPage<L>;
  depositPage: DepositPage<L>;
  previewPage: PreviewPage<L>;
  recordDetailPage: RecordDetailPage<L>;
  administrationPage: AdministrationPage<L>;
}

export type AllPagesKeys = Extract<keyof AllPages, string>;
