#!/usr/bin/env node

/**
 * Collect translations from Invenio packages into JSON files.
 *
 * Scans PO files from Invenio packages and converts them to JSON format
 * for validation and testing purposes.
 */

const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = process.env.I18N_OUTPUT_DIR || path.join("src", "translations");

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
// IMPLEMENTATION FUNCTIONS
// =============================================================================

/**
 * Find package in multiple fallback locations.
 */
function resolvePackagePath(packageName) {
  const locations = [
    process.env.INVENIO_PACKAGES_DIR &&
      path.join(process.env.INVENIO_PACKAGES_DIR, packageName),
    path.resolve(__dirname, "../..", packageName),
    path.resolve(__dirname, "..", packageName),
  ].filter(Boolean);

  return locations.find(fs.existsSync) || null;
}

/**
 * Parses a .po file using the i18next-conv library and converts it to translation format.
 */
async function parsePoFile(poFilePath, packageName) {
  try {
    const { gettextToI18next } = await import("i18next-conv");
    const poContent = fs.readFileSync(poFilePath, "utf8");

    const result = await gettextToI18next("", poContent, {
      skipUntranslated: true,
      compatibilityJSON: "v4",
    });

    const translations = JSON.parse(result);
    const output = {};

    for (const [key, value] of Object.entries(translations)) {
      if (key && value && typeof value === "string") {
        const translationValue = value.trim() || key;
        output[key] = translationValue;
        output[`${packageName}:${key}`] = translationValue;
      }
    }

    return output;
  } catch (error) {
    console.warn(`Failed to parse ${poFilePath}:`, error.message);
    return {};
  }
}

/**
 * Analyzes PO file for untranslated strings and quality issues.
 */

/**
 * Creates a validation report for PO file analyzing untranslated strings and quality issues.
 *
 * @param {string} poFilePath - Path to the .po file
 * @param {string} packageName - Package name for context
 * @param {string} locale - Locale being analyzed
 * @returns {Object} Validation report
 */
function createValidationReportOfPoFile(poFilePath, packageName, locale) {
  try {
    const poContent = fs.readFileSync(poFilePath, "utf8");
    const lines = poContent.split("\n");

    const issues = {
      untranslated: [],
      fuzzyTranslations: [],
      obsoleteTranslations: [],
    };

    let currentMsgid = "";
    let currentMsgstr = "";
    let isFuzzy = false;
    let isObsolete = false;
    let inMsgid = false;
    let inMsgstr = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for flags
      if (trimmed.startsWith("#,") && trimmed.includes("fuzzy")) {
        isFuzzy = true;
      }
      if (trimmed.startsWith("#~")) {
        isObsolete = true;
      }

      // Parse msgid and msgstr
      if (trimmed.startsWith("msgid ")) {
        currentMsgid = trimmed.substring(6).replace(/^"(.*)"$/, "$1");
        inMsgid = true;
        inMsgstr = false;
      } else if (inMsgid && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        currentMsgid += trimmed.replace(/^"(.*)"$/, "$1");
      } else if (trimmed.startsWith("msgstr ")) {
        currentMsgstr = trimmed.substring(7).replace(/^"(.*)"$/, "$1");
        inMsgid = false;
        inMsgstr = true;
      } else if (inMsgstr && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        currentMsgstr += trimmed.replace(/^"(.*)"$/, "$1");
      } else if (trimmed === "" || trimmed.startsWith("msgid ")) {
        // End of entry - process it
        if (currentMsgid && currentMsgid !== "") {
          if (isObsolete) {
            issues.obsoleteTranslations.push(currentMsgid);
          } else if (isFuzzy) {
            issues.fuzzyTranslations.push(currentMsgid);
          } else if (!currentMsgstr || currentMsgstr === "") {
            issues.untranslated.push(currentMsgid);
          }
        }

        // Reset for next entry
        currentMsgid = "";
        currentMsgstr = "";
        isFuzzy = false;
        isObsolete = false;
        inMsgid = false;
        inMsgstr = false;

        if (trimmed.startsWith("msgid ")) {
          currentMsgid = trimmed.substring(6).replace(/^"(.*)"$/, "$1");
          inMsgid = true;
        }
      }
    }

    return {
      package: packageName,
      locale: locale,
      file: poFilePath,
      issues: issues,
      counts: {
        untranslated: issues.untranslated.length,
        fuzzyTranslations: issues.fuzzyTranslations.length,
        obsoleteTranslations: issues.obsoleteTranslations.length,
      },
    };
  } catch (error) {
    console.warn(`Failed to validate ${poFilePath}:`, error.message);
    return null;
  }
}

/**
 * Scans an Invenio package directory for translation files and extracts all translations.
 *
 * This function looks for translations in the standard Invenio directory structure:
 * - first tries: packagePath/packageName/translations/
 * - falls back to: packagePath/translations/
 *
 * Within the translations directory, it scans for locale subdirectories containing
 * LC_MESSAGES/messages.po files following the GNU gettext convention.
 *
 * @param {string} packagePath - Path to the package directory
 * @param {string} packageName - Name of the package (used for namespacing)
 * @param {boolean} includeValidation - Whether to include validation analysis
 * @returns {Promise<Object>} Object mapping locale codes to their translations
 *
 * @example
 * // Returns structure like:
 * {
 *   "en": { "Home": "Home", "invenio_app_rdm:Home": "Home" },
 *   "de": { "Home": "Startseite", "invenio_app_rdm:Home": "Startseite" }
 * }
 */
async function scanPackage(
  packagePath,
  packageName,
  includeValidation = false
) {
  const translations = {};
  const validationReport = [];

  // Find translations directory
  let translationsDir = path.join(packagePath, packageName, "translations");
  if (!fs.existsSync(translationsDir)) {
    translationsDir = path.join(packagePath, "translations");
  }

  if (!fs.existsSync(translationsDir)) {
    return { translations, validationReport };
  }

  // Scan locale directories
  const locales = fs.readdirSync(translationsDir);
  for (const locale of locales) {
    const localePath = path.join(translationsDir, locale);
    if (fs.statSync(localePath).isDirectory()) {
      const poFile = path.join(localePath, "LC_MESSAGES/messages.po");
      if (fs.existsSync(poFile)) {
        translations[locale] = await parsePoFile(poFile, packageName);

        if (includeValidation) {
          const validation = createValidationReportOfPoFile(
            poFile,
            packageName,
            locale
          );
          if (validation) {
            validationReport.push(validation);
          }
        }
      }
    }
  }

  return { translations, validationReport };
}
