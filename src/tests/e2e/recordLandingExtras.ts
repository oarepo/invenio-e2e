import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";

export function recordLandingExtrasTests(test: InvenioTest) {
  test.describe("Record Landing Page – Extras", () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
      await homePage.openPage();
      await homePage.login();
    });

    test("Citation", async ({ myDashboardPage, recordDetailPage }) => {
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();

      // Harvard
      await recordDetailPage.selectCitationStyle("Harvard");
      expect(await recordDetailPage.getSelectedStyle()).toBe("Harvard");
      const citationHarvard = await recordDetailPage.getCitationText();
      expect(citationHarvard).toMatch(/^[a-zA-Z]+[.,]?\s*\(\d{4}\)/);

      // APA
      await recordDetailPage.selectCitationStyle("APA");
      expect(await recordDetailPage.getSelectedStyle()).toBe("APA");
      const citationApa = await recordDetailPage.getCitationText();
      expect(citationApa).toMatch(/^\w+.*\(\d{4}/);

      // IEEE
      await recordDetailPage.selectCitationStyle("IEEE");
      expect(await recordDetailPage.getSelectedStyle()).toBe("IEEE");
      const citationIeee = await recordDetailPage.getCitationText();
      expect(citationIeee).toMatch(/\[\d+\]/);
    });

    //-----------------------------------------------------------------------------------

    test("Export", async ({ myDashboardPage, recordDetailPage, page }) => {
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();

      const exportFormats = ["DCAT", "JSON-LD", "JSON", "DataCite JSON"];

      for (const format of exportFormats) {
        await recordDetailPage.selectFileFormat(format);

        const downloadPromise = recordDetailPage.clickExportButton();
        const download = await Promise.race([
          downloadPromise,
          page.waitForEvent("download", { timeout: 15000 }),
        ]);

        expect(download).toBeTruthy();
      }
    });

    //-----------------------------------------------------------------------------------

    test("Files", async ({ myDashboardPage, recordDetailPage }) => {
      await myDashboardPage.navigateToMyDashboard();
      await myDashboardPage.firstRecordDetail();

      await recordDetailPage.clickDownload();
      await recordDetailPage.clickDownloadAll();
      await recordDetailPage.clickPreview();

      expect(await recordDetailPage.isPreviewContainerVisible()).toBeTruthy();
      expect(await recordDetailPage.isPreviewIframeInsideContainer()).toBeTruthy();
    });
  });
}
