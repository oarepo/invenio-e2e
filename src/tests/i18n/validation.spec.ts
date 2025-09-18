import { InvenioTest } from "../../fixtures";
import { expect } from "@playwright/test";
import fs from "fs";
import path from "path";

interface ValidationIssues {
  untranslated: string[];
  fuzzyTranslations: string[];
  obsoleteTranslations: string[];
}

interface ValidationReport {
  package: string;
  locale: string;
  file: string;
  issues: ValidationIssues;
  counts: {
    untranslated: number;
    fuzzyTranslations: number;
    obsoleteTranslations: number;
  };
}

interface ValidationSummary {
  generatedAt: string;
  packages: string[];
  summary: {
    totalPackages: number;
    totalLocales: number;
    totalIssues: number;
    untranslatedStrings: number;
    fuzzyTranslations: number;
  };
  reports: ValidationReport[];
}

function readValidationReport(): ValidationSummary | null {
  const reportPath = path.resolve("translations/validation-report.json");
  if (!fs.existsSync(reportPath)) return null;
  return JSON.parse(fs.readFileSync(reportPath, "utf8")) as ValidationSummary;
}

/**
 * Runs a set of tests for translation validation.
 *
 * @param test - The InvenioTest instance to use for the tests.
 */
export function i18nValidationTests(test: InvenioTest) {
  test.describe("Translation validation (fast, no browser)", () => {
    test("Completeness and quality thresholds", async () => {
      const summary = readValidationReport();
      if (!summary)
        test.skip(true, "Validation report missing. Run `npm run collect-translations:validate`.");

      const { summary: s, reports } = summary!;

      expect(
        s.untranslatedStrings,
        `Found ${s.untranslatedStrings} untranslated strings. See validation-report.json.`
      ).toBeLessThanOrEqual(30000);

      const perLocaleTotals = new Map<string, { total: number; untranslated: number }>();
      for (const r of reports) {
        if (!perLocaleTotals.has(r.locale))
          perLocaleTotals.set(r.locale, { total: 0, untranslated: 0 });
        const a = perLocaleTotals.get(r.locale)!;
        a.total +=
          r.counts.untranslated + r.counts.fuzzyTranslations + r.counts.obsoleteTranslations;
        a.untranslated += r.counts.untranslated;
      }

      for (const [locale, stats] of perLocaleTotals.entries()) {
        if (stats.total > 0) {
          const coverage = ((stats.total - stats.untranslated) / stats.total) * 100;
          expect(
            coverage,
            `${locale} coverage too low: ${coverage.toFixed(1)}%`
          ).toBeGreaterThanOrEqual(20);
        }
      }
      expect(
        s.fuzzyTranslations,
        `Too many fuzzy translations (${s.fuzzyTranslations}).`
      ).toBeLessThanOrEqual(5000);
    });
  });
}
