#!/usr/bin/env node

/**
 * Generate POT file from Invenio packages
 *
 * This script creates a .pot file with all the translatable strings from Invenio.
 * It tries two ways:
 * 1. Use the invenio i18n command (works if invenio-i18n is installed)
 * 2. Use pybabel directly (backup plan if invenio command fails)
 *
 * You need a Python venv with either invenio-i18n or babel installed.
 *
 * How to use:
 * - npm run generate-pot (basic usage)
 * - VENV_PATH=/my/venv npm run generate-pot (custom venv)
 * - npm run generate-pot --output my.pot (custom output file)
 */

const fs = require("fs");
const path = require("path");
const { findVirtualEnv, getSitePackagesPath } = require("./lib/venvUtils");
const { tryInvenioI18nCommand, extractStringsWithPybabel } = require("./lib/potUtils");
const { TranslationLogger } = require("./lib/logger");

const OUTPUT_DIR = process.env.I18N_OUTPUT_DIR || path.join("src", "translations");

async function main() {
  const logger = new TranslationLogger();

  // Comment: ALGORITHM - POT Generation
  // Setup: Parse args and prepare environment
  // Method A: Use invenio i18n command (preferred)
  // Method B: Use pybabel extraction (fallback)

  const config = parseArgumentsAndSetup(logger);

  if (await tryInvenioMethod(config, logger)) {
    return;
  }

  await tryPybabelMethod(config, logger);
}

// Parse command line args and make sure output folder exists
function parseArgumentsAndSetup(logger) {
  logger.logPotGenerationStart();

  const args = process.argv.slice(2);
  const outputIndex = args.indexOf("--output");
  const customOutput = outputIndex !== -1 ? args[outputIndex + 1] : null;
  const outputFile = customOutput || path.join(OUTPUT_DIR, "messages.pot");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  return { outputFile };
}

// Try the invenio command first (this is the best way if it works)
async function tryInvenioMethod(config, logger) {
  const venvInfo = findVirtualEnv();
  if (!venvInfo) {
    logger.logVenvNotFound();
    process.exit(1);
  }
  logger.logUsingVenv(venvInfo.path);

  const result = tryInvenioI18nCommand(venvInfo, config.outputFile);
  if (result.success) {
    logger.logPotFileGenerated(config.outputFile, "core invenio-i18n create-global-pot command");
    return true;
  }

  return false;
}

// If invenio command failed, try pybabel directly
async function tryPybabelMethod(config, logger) {
  logger.logFallbackToPybabel();

  const venvInfo = findVirtualEnv();
  const sitePackagesPath = getSitePackagesPath(venvInfo.path);
  if (!sitePackagesPath) {
    logger.logSitePackagesNotFound(venvInfo.path);
    process.exit(1);
  }

  logger.logSitePackagesPath(sitePackagesPath);

  try {
    await extractStringsWithPybabel(sitePackagesPath, config.outputFile, venvInfo);
    logger.logPotFileGenerated(config.outputFile);
  } catch (error) {
    logger.logPybabelFailed(error.message);
    process.exit(1);
  }
}

main().catch(console.error);

// =============================================================================
// Implementation functions in ./lib/venvUtils.js and ./lib/potUtils.js
// =============================================================================
