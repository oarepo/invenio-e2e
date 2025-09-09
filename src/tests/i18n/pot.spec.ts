import { expect, test } from '@playwright/test';

import fs from 'fs';
import path from 'path';

interface PotComparisonReport {
  generatedAt: string;
  potFile: {
    totalStrings: number;
    strings: string[];
  };
  locales: {
    [locale: string]: {
      totalTranslations: number;
      missingFromPot: string[];
      missingFromLocale: string[];
      coveragePercentage: number;
    };
  };
}

function readPotComparisonReport(): PotComparisonReport | null {
  const reportPath = path.join(__dirname, '../../translations/pot-comparison-report.json');
  if (!fs.existsSync(reportPath)) return null;
  return JSON.parse(fs.readFileSync(reportPath, 'utf8')) as PotComparisonReport;
}

test.describe('POT synchronization (fast, no browser)', () => {
  test('POT file synchronization validation', async () => {
    const report = readPotComparisonReport();
    if (!report) test.skip(true, 'POT comparison report missing. Run `npm run generate-pot`.');

    const { potFile, locales } = report!;

    expect(potFile.totalStrings, 'POT file should contain translatable strings').toBeGreaterThan(0);

    for (const [locale, info] of Object.entries(locales)) {
      expect(
        info.missingFromLocale.length,
        `${locale} is missing ${info.missingFromLocale.length} strings from POT file`
      ).toBeLessThanOrEqual(1000); 
    }

    for (const [locale, info] of Object.entries(locales)) {
      expect(
        info.missingFromPot.length,
        `${locale} has ${info.missingFromPot.length} obsolete strings not in POT`
      ).toBeLessThanOrEqual(1000); 
    }
  });
});


