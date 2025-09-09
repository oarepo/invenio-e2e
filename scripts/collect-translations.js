#!/usr/bin/env node

/**
 * Collect translations from Invenio packages into JSON files.
 *
 * Scans PO files from Invenio packages and converts them to JSON format
 * for validation and testing purposes.
 */

const fs = require("fs");
const path = require("path");
const { resolvePackagePath, scanPackage } = require("./lib/translationUtils");

const OUTPUT_DIR =
  process.env.I18N_OUTPUT_DIR || path.join("src", "translations");

/**
 * MAIN ALGORITHM: Translation Collection
 *
 * 1: Find Invenio packages in various locations
 * 2: Scan each package for PO files
 * 3: Parse PO files to JSON format
 * 4: Optionally validate translations for issues
 * 5: Write combined translations.json + validation report
 */
async function main() {
  const args = process.argv.slice(2);
  const includeValidation = args.includes("--validate");
  const packages = args.filter((arg) => !arg.startsWith("--"));
  const packageList =
    packages.length > 0 ? packages : ["invenio-app-rdm", "invenio-rdm-records"];

  console.log(
    `Collecting translations from ${
      packages.length > 0 ? "specified" : "default"
    } packages`
  );
  if (includeValidation) {
    console.log("Validation enabled - generating translation quality report");
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allTranslations = {};
  const allValidationReports = [];
  let packageCount = 0;

  for (const pkg of packageList) {
    const packagePath = resolvePackagePath(pkg);
    if (!packagePath) {
      console.warn(`Package not found: ${pkg}`);
      continue;
    }

    const packageName = pkg.replace(/-/g, "_");
    const { translations, validationReport } = await scanPackage(
      packagePath,
      packageName,
      includeValidation
    );

    if (Object.keys(translations).length === 0) continue;

    const packageDir = path.join(OUTPUT_DIR, packageName);
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(
      path.join(packageDir, "translations.json"),
      JSON.stringify(translations, null, 2)
    );

    for (const [locale, localeTranslations] of Object.entries(translations)) {
      if (!allTranslations[locale]) allTranslations[locale] = {};
      Object.assign(allTranslations[locale], localeTranslations);
    }

    if (includeValidation && validationReport.length > 0) {
      allValidationReports.push(...validationReport);
    }

    console.log(
      `${packageName}: ${
        Object.keys(translations).length
      } locales (${packagePath})`
    );
    packageCount++;
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "translations.json"),
    JSON.stringify(allTranslations, null, 2)
  );

  if (includeValidation && allValidationReports.length > 0) {
    const validationSummary = {
      generatedAt: new Date().toISOString(),
      packages: packageList,
      summary: {
        totalPackages: packageCount,
        totalLocales: Object.keys(allTranslations).length,
        totalIssues: allValidationReports.reduce(
          (sum, report) =>
            sum + Object.values(report.counts).reduce((a, b) => a + b, 0),
          0
        ),
        untranslatedStrings: allValidationReports.reduce(
          (sum, report) => sum + report.counts.untranslated,
          0
        ),
        fuzzyTranslations: allValidationReports.reduce(
          (sum, report) => sum + report.counts.fuzzyTranslations,
          0
        ),
      },
      reports: allValidationReports,
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "validation-report.json"),
      JSON.stringify(validationSummary, null, 2)
    );

    console.log(`\nValidation Summary:`);
    console.log(
      `  Total issues found: ${validationSummary.summary.totalIssues}`
    );
    console.log(
      `  Untranslated strings: ${validationSummary.summary.untranslatedStrings}`
    );
    console.log(
      `  Fuzzy translations: ${validationSummary.summary.fuzzyTranslations}`
    );
    console.log(`  Report saved: src/translations/validation-report.json`);
  }

  const totalLocales = Object.keys(allTranslations).length;
  console.log(`Total: ${totalLocales} locales across ${packageCount} packages`);
}

main().catch(console.error);

// =============================================================================
// Implementation functions in ./lib/translationUtils.js
// =============================================================================
