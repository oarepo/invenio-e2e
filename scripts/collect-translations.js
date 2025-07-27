#!/usr/bin/env node

/**
 * Script to collect translations from Invenio packages
 * Creates a pre-compiled translations.json for faster test execution
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/translations/translations.json');

/**
 * Main function to collect translations
 */
function collectTranslations() {
    const translations = {};
    
    // Get package names from command line arguments
    const args = process.argv.slice(2);
    let packageDirs;
    
    if (args.length > 0) {
        // Use specified packages
        packageDirs = args.map(pkg => `../${pkg}`);
        console.log(`Collecting translations for specified packages: ${args.join(', ')}`);
    } else {
        // Default packages
        packageDirs = [
            '../invenio-app-rdm',
            '../invenio-rdm-records'
        ];
        console.log('Collecting translations for default packages (use "npm run collect-translations package1 package2" to specify)');
    }

    for (const packageDir of packageDirs) {
        const fullPath = path.resolve(__dirname, '..', packageDir);
        console.log(`Checking ${packageDir} at ${fullPath}...`);
        if (fs.existsSync(fullPath)) {
            console.log(`Scanning ${packageDir}...`);
            scanPackage(fullPath, translations);
        } else {
            console.log(`Package not found: ${fullPath}`);
        }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write compiled JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(translations, null, 2));
    console.log(`Translations written to ${OUTPUT_FILE}`);
    console.log(`Found ${Object.keys(translations).length} locales`);
    
    // Show sample counts per locale
    for (const locale of Object.keys(translations).slice(0, 3)) {
        const count = Object.keys(translations[locale]).length;
        console.log(`  ${locale}: ${count} translation strings`);
    }
}

/**
 * Scan a package for translation files
 */
function scanPackage(packagePath, translations) {
    const packageName = path.basename(packagePath).replace(/-/g, '_');
    const translationsDir = path.join(packagePath, packageName, 'translations');
    
    if (fs.existsSync(translationsDir)) {
        console.log(`  Found translations directory: ${translationsDir}`);
        // Find locale directories
        const entries = fs.readdirSync(translationsDir);
        for (const entry of entries) {
            const entryPath = path.join(translationsDir, entry);
            if (fs.statSync(entryPath).isDirectory()) {
                // This is a locale directory (en, de, fr, etc.)
                const poFile = path.join(entryPath, 'LC_MESSAGES/messages.po');
                if (fs.existsSync(poFile)) {
                    console.log(`  Found ${entry} translations at ${poFile}`);
                    if (!translations[entry]) translations[entry] = {};
                    parseSimplePo(poFile, translations[entry], packageName);
                }
            }
        }
    } else {
        console.log(`  No translations directory found at ${translationsDir}`);
    }
}

/**
 * Simple .po file parser
 */
function parseSimplePo(poFile, localeTranslations, packageName) {
    const content = fs.readFileSync(poFile, 'utf-8');
    const lines = content.split('\n');
    
    let msgid = '';
    let msgstr = '';
    let inMsgid = false;
    let inMsgstr = false;

    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('msgid ')) {
            msgid = trimmed.slice(6).replace(/^"|"$/g, '');
            inMsgid = true;
            inMsgstr = false;
        } else if (trimmed.startsWith('msgstr ')) {
            msgstr = trimmed.slice(7).replace(/^"|"$/g, '');
            inMsgstr = true;
            inMsgid = false;
        } else if (trimmed.startsWith('"') && inMsgid) {
            msgid += trimmed.replace(/^"|"$/g, '');
        } else if (trimmed.startsWith('"') && inMsgstr) {
            msgstr += trimmed.replace(/^"|"$/g, '');
        } else if (trimmed === '') {
            // End of entry
            if (msgid && msgstr && msgid !== '') {
                // Store both flat and package-scoped translations
                localeTranslations[msgid] = msgstr;
                
                // Also store with package prefix for specific lookups
                if (!localeTranslations[`${packageName}:${msgid}`]) {
                    localeTranslations[`${packageName}:${msgid}`] = msgstr;
                }
            }
            msgid = '';
            msgstr = '';
            inMsgid = false;
            inMsgstr = false;
        }
    }
}

// Run the script
collectTranslations(); 