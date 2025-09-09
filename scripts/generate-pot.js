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
const { findVirtualEnv, getSitePackagesPath } = require("./lib/venv");
const { tryInvenioI18nCommand, extractStringsWithPybabel } = require("./lib/potExtraction");

const OUTPUT_DIR = path.join(__dirname, "../src/translations");

async function main() {
    const args = process.argv.slice(2);
    const outputIndex = args.indexOf('--output');
    const customOutput = outputIndex !== -1 ? args[outputIndex + 1] : null;
    
    console.log('POT Generation: invenio i18n create-global-pot');
    console.log('===================================================');
    
    // First we find the virtual environment
    const venvInfo = findVirtualEnv();
    if (!venvInfo) {
        console.error("Virtual environment not found!");
        console.error("Please set VENV_PATH or create a .venv in an Invenio package directory.");
        process.exit(1);
    }
    console.log(`Using virtual environment: ${venvInfo.path}`);
    
    const outputFile = customOutput || path.join(OUTPUT_DIR, "messages.pot");
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    
    // Second we try the invenio i18n create-global-pot command
    const invenioResult = tryInvenioI18nCommand(venvInfo, outputFile);
    if (invenioResult.success) {
        console.log(`POT file generated: ${outputFile}`);
        console.log("Used core invenio-i18n create-global-pot command");
        return;
    }
    
    // Third we fallback to pybabel extraction
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