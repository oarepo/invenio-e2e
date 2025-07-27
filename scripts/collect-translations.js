#!/usr/bin/env node

/**
 * Collect translations from Invenio packages into a pre-compiled JSON file
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/translations/translations.json');

function collectTranslations() {
    const translations = {};
    const args = process.argv.slice(2);
    
    const packageDirs = args.length > 0 
        ? args.map(pkg => `../${pkg}`)
        : ['../invenio-app-rdm', '../invenio-rdm-records'];
    
    console.log(`Collecting translations from ${args.length > 0 ? 'specified' : 'default'} packages`);

    for (const packageDir of packageDirs) {
        const fullPath = path.resolve(__dirname, '..', packageDir);
        if (fs.existsSync(fullPath)) {
            scanPackage(fullPath, translations);
        }
    }

    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(translations, null, 2));
    
    const localeCount = Object.keys(translations).length;
    console.log(`Written ${localeCount} locales to ${OUTPUT_FILE}`);
}

function scanPackage(packagePath, translations) {
    const packageName = path.basename(packagePath).replace(/-/g, '_');
    const translationsDir = path.join(packagePath, packageName, 'translations');
    
    if (!fs.existsSync(translationsDir)) {
        return;
    }

    const entries = fs.readdirSync(translationsDir);
    for (const entry of entries) {
        const entryPath = path.join(translationsDir, entry);
        if (fs.statSync(entryPath).isDirectory()) {
            const poFile = path.join(entryPath, 'LC_MESSAGES/messages.po');
            if (fs.existsSync(poFile)) {
                if (!translations[entry]) translations[entry] = {};
                parsePoFile(poFile, translations[entry], packageName);
            }
        }
    }
}

function parsePoFile(poFile, localeTranslations, packageName) {
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
            if (msgid && msgstr && msgid !== '') {
                localeTranslations[msgid] = msgstr;
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

collectTranslations(); 