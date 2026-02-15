import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function administrationPageTests(test: InvenioTest) {
  test.describe("Administration Page Tests", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test.beforeEach(async ({ homePage, config, loginPage }) => {
      // Open application and log in as admin (to access the administration page)
      await homePage.openPage();
      await homePage.login({ username: config.adminEmail, password: config.adminPassword });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test.afterEach(async ({ homePage, administrationPage, loginPage, services }) => {
      if (await services.login.isUserLoggedIn()) {
        // Clean up any banners that might have been created during the tests
        await administrationPage.openPage();
        await administrationPage.navigateToBannersSection();
        await administrationPage.deleteAllBanners();
        // Log out after each test
        await homePage.openPage();
        await homePage.logout();
      }
    });

    test("Access Administration page as admin", async ({ administrationPage }) => {
      await administrationPage.openPage();
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    test("Accessing Administration page as anonym should fail", async ({ homePage, loginPage, page, locators }) => {
      // Log out admin
      await homePage.logout();
      // Try to access administration page as anonymous user
      await page.goto("/administration");
      await page.waitForLoadState("networkidle");
      await expect(page.locator(locators.global.permisionRequiredMessage)).toBeVisible();
    });

    test("Create a new banner and validate it appears in the list and on site", async ({ administrationPage }) => {
      const bannerMessage = `E2E banner ${Date.now()}`;
      const bannerUrlPath = "/search";

      await administrationPage.openPage();
      await administrationPage.navigateToBannersSection();
      await administrationPage.navigateToBannersCreation();
      await administrationPage.fillBannerMessage(bannerMessage);
      await administrationPage.fillBannerUrlPath(bannerUrlPath);
      await administrationPage.clickSubmitCreateBanner();
      await administrationPage.waitForSubmission();

      await administrationPage.validateBannerIsPresent(bannerMessage);
      await administrationPage.validateBannerPresentOnSite(
        bannerMessage,
        bannerUrlPath,
      );
    });
  });
}
