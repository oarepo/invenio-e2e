#!/usr/bin/env node

/**
 * Collect translations from Invenio packages
 *
 * This script finds all the .po translation files in Invenio packages and
 * converts them to JSON format that we can use in tests.
 *
 * It looks for packages in different places and scans each one for translations.
 * Can also check for missing translations if you use --validate.
 *
 * How to use:
 * - npm run collect-translations (basic usage)
 * - npm run collect-translations --validate (also check for problems)
 * - npm run collect-translations invenio-app-rdm (specific package)
 */

const fs = require("fs");
const path = require("path");
const { resolvePackagePath, scanPackage } = require("./lib/translationUtils");
const { TranslationLogger } = require("./lib/logger");

const OUTPUT_DIR = process.env.I18N_OUTPUT_DIR || path.join("src", "translations");

// Comment: Algorithm - Find packages, scan PO files, convert to JSON, optionally validate
async function main() {
  const args = process.argv.slice(2);
  const includeValidation = args.includes("--validate");
  const packages = args.filter((arg) => !arg.startsWith("--"));
  const packageList = packages.length > 0 ? packages : ["invenio-app-rdm", "invenio-rdm-records"];
  const logger = new TranslationLogger();

  logger.logStart(packages, includeValidation);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allTranslations = {};
  const allValidationReports = [];
  let packageCount = 0;

  for (const pkg of packageList) {
    const packagePath = resolvePackagePath(pkg);
    if (!packagePath) {
      logger.logPackageNotFound(pkg);
      continue;
    }

    const packageName = pkg.replace(/-/g, "_");
    const { translations, validationReport } = await scanPackage(
      packagePath,
      packageName,
      includeValidation
    );

    if (Object.keys(translations).length === 0) {
      continue;
    }

    writeTranslations(OUTPUT_DIR, packageName, translations);

    for (const [locale, localeTranslations] of Object.entries(translations)) {
      if (!allTranslations[locale]) {
        allTranslations[locale] = {};
      }
      Object.assign(allTranslations[locale], localeTranslations);
    }

    if (includeValidation && validationReport.length > 0) {
      allValidationReports.push(...validationReport);
    }

    logger.logPackageProcessed(packageName, Object.keys(translations).length, packagePath);
    packageCount++;
  }

  writeJsonFile(OUTPUT_DIR, "translations.json", allTranslations);

  if (includeValidation && allValidationReports.length > 0) {
    const validationSummary = createValidationSummary(
      packageList,
      packageCount,
      allTranslations,
      allValidationReports
    );

    writeJsonFile(OUTPUT_DIR, "validation-report.json", validationSummary);

    logger.logValidationSummary(validationSummary.summary);
  }

  const totalLocales = Object.keys(allTranslations).length;
  logger.logFinalSummary(totalLocales, packageCount);
}

/**
 * Write JSON data to a file.
 */
function writeJsonFile(outputDir, fileName, data) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(data, null, 2));
}

/**
 * Create validation summary with calculated statistics.
 */
function createValidationSummary(packageList, packageCount, allTranslations, allValidationReports) {
  return {
    generatedAt: new Date().toISOString(),
    packages: packageList,
    summary: {
      totalPackages: packageCount,
      totalLocales: Object.keys(allTranslations).length,
      totalIssues: allValidationReports.reduce(
        (sum, report) => sum + Object.values(report.counts).reduce((a, b) => a + b, 0),
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
}

/**
 * Write translations to a JSON file in the package directory.
 */
function writeTranslations(outputDir, packageName, translations) {
  const packageDir = path.join(outputDir, packageName);
  writeJsonFile(packageDir, "translations.json", translations);
}

main().catch(console.error);

// =============================================================================
// Implementation functions in ./lib/translationUtils.js
// =============================================================================
