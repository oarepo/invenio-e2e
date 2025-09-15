/**
 * Logging utility for translation collection and POT generation processes.
 */

class TranslationLogger {
  logStart(packages, includeValidation) {
    console.log(
      `Collecting translations from ${packages.length > 0 ? "specified" : "default"} packages`
    );
    if (includeValidation) {
      console.log("Validation enabled - generating translation quality report");
    }
  }

  logPackageNotFound(packageName) {
    console.warn(`Package not found: ${packageName}`);
  }

  logPackageProcessed(packageName, localeCount, packagePath) {
    console.log(`${packageName}: ${localeCount} locales (${packagePath})`);
  }

  logValidationSummary(summary) {
    console.log(`\nValidation Summary:`);
    console.log(`  Total issues found: ${summary.totalIssues}`);
    console.log(`  Untranslated strings: ${summary.untranslatedStrings}`);
    console.log(`  Fuzzy translations: ${summary.fuzzyTranslations}`);
    console.log(`  Report saved: src/translations/validation-report.json`);
  }

  logFinalSummary(totalLocales, packageCount) {
    console.log(`Total: ${totalLocales} locales across ${packageCount} packages`);
  }

  logPotGenerationStart() {
    console.log("POT Generation: invenio i18n create-global-pot");
    console.log("===================================================");
  }

  logVenvNotFound() {
    console.error("Virtual environment not found!");
    console.error("Please set VENV_PATH or create a .venv in an Invenio package directory.");
  }

  logUsingVenv(venvPath) {
    console.log(`Using virtual environment: ${venvPath}`);
  }

  logPotFileGenerated(outputFile, method) {
    console.log(`POT file generated: ${outputFile}`);
    if (method) {
      console.log(`Used ${method}`);
    }
  }

  logFallbackToPybabel() {
    console.log("Falling back to direct pybabel extraction...");
  }

  logSitePackagesNotFound(venvPath) {
    console.error(`Site-packages directory not found in: ${venvPath}`);
  }

  logSitePackagesPath(sitePackagesPath) {
    console.log(`Site-packages path: ${sitePackagesPath}`);
  }

  logPybabelFailed(errorMessage) {
    console.error(`Pybabel extraction failed: ${errorMessage}`);
  }

  logTryingInvenioCommand() {
    console.log("Trying invenio i18n create-global-pot...");
  }

  logRunningCommand(command) {
    console.log(`Running: ${command}`);
  }

  logInvenioCommandSucceeded() {
    console.log("invenio i18n create-global-pot succeeded!");
  }

  logInvenioCommandFailed() {
    console.log("invenio i18n create-global-pot not available, falling back to pybabel...");
  }

  logExtractingPackages(packageCount) {
    console.log(`Extracting strings from ${packageCount} packages`);
  }

  logPybabelSuccess() {
    console.log("POT file generated successfully");
  }
}

module.exports = { TranslationLogger };
