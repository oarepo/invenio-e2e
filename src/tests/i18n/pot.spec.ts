import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * Runs a set of tests for POT file generation.
 *
 * @param test - The InvenioTest instance to use for the tests.
 */
export function i18nPOTTests(test: InvenioTest) {
  test.describe("POT file generation (fast, no browser)", () => {
    test("POT file exists and contains translatable strings", () => {
      const potFilePath = path.resolve("translations/messages.pot");

      expect(fs.existsSync(potFilePath), "POT file should exist. Run `npm run generate-pot`.").toBe(
        true
      );

      const potContent = fs.readFileSync(potFilePath, "utf8");
      expect(potContent.length, "POT file should not be empty").toBeGreaterThan(0);

      const msgidCount = (potContent.match(/^msgid\s+"/gm) || []).length;
      expect(
        msgidCount,
        "POT file should contain translatable strings (msgid entries)"
      ).toBeGreaterThan(0);
    });
  });
}
