#!/usr/bin/env node

/**
 * POT File Generation
 *
 * Algorithm: detect venv → run `invenio i18n create-global-pot` → if missing, run `pybabel extract` → write messages.pot
 *
 * Usage:
 * - `npm run generate-pot` - Generate POT using invenio i18n create-global-pot
 * - `VENV_PATH=/path/to/venv npm run generate-pot` - Use custom virtual environment
 * - `npm run generate-pot --output path/to/output.pot` - Custom output location
 */

const fs = require("fs");
const path = require("path");
const { findVirtualEnv, getSitePackagesPath } = require("./lib/venvUtils");
const {
  tryInvenioI18nCommand,
  extractStringsWithPybabel,
} = require("./lib/potUtils");

const OUTPUT_DIR =
  process.env.I18N_OUTPUT_DIR || path.join("src", "translations");

/**
 * MAIN ALGORITHM: POT Generation
 *
 * 1: Find virtual environment
 * 2: Try invenio i18n create-global-pot command
 * 3: Fallback to direct pybabel extraction
 * 4: Write POT file to translations/
 */
async function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf("--output");
  const customOutput = outputIndex !== -1 ? args[outputIndex + 1] : null;

  console.log("POT Generation: invenio i18n create-global-pot");
  console.log("===================================================");

  const venvInfo = findVirtualEnv();
  if (!venvInfo) {
    console.error("Virtual environment not found!");
    console.error(
      "Please set VENV_PATH or create a .venv in an Invenio package directory."
    );
    process.exit(1);
  }
  console.log(`Using virtual environment: ${venvInfo.path}`);

  const outputFile = customOutput || path.join(OUTPUT_DIR, "messages.pot");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const invenioResult = tryInvenioI18nCommand(venvInfo, outputFile);
  if (invenioResult.success) {
    console.log(`POT file generated: ${outputFile}`);
    console.log("Used core invenio-i18n create-global-pot command");
    return;
  }

  console.log("Falling back to direct pybabel extraction...");

  const sitePackagesPath = getSitePackagesPath(venvInfo.path);
  if (!sitePackagesPath) {
    console.error(`Site-packages directory not found in: ${venvInfo.path}`);
    process.exit(1);
  }

  console.log(`Site-packages path: ${sitePackagesPath}`);
  await extractStringsWithPybabel(sitePackagesPath, outputFile, venvInfo);

  console.log(`POT file generated: ${outputFile}`);
}

main().catch(console.error);

// =============================================================================
// Implementation functions in ./lib/venvUtils.js and ./lib/potUtils.js
// =============================================================================
