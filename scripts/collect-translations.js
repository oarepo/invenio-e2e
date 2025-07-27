#!/usr/bin/env node

/**
 * Collect translations from Invenio packages into package-specific JSON files
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../src/translations');

function collectTranslations() {
    const args = process.argv.slice(2);
    
    const packageDirs = args.length > 0 
        ? args.map(pkg => `../${pkg}`)
        : ['../invenio-app-rdm', '../invenio-rdm-records'];
    
    console.log(`Collecting translations from ${args.length > 0 ? 'specified' : 'default'} packages`);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let totalLocales = new Set();
    let totalPackages = 0;

    for (const packageDir of packageDirs) {
        const fullPath = path.resolve(__dirname, '..', packageDir);
        if (fs.existsSync(fullPath)) {
            const packageTranslations = {};
            const packageName = path.basename(fullPath).replace(/-/g, '_');
            
            scanPackage(fullPath, packageTranslations, packageName);
            
            if (Object.keys(packageTranslations).length > 0) {
                // Create package-specific directory
                const packageOutputDir = path.join(OUTPUT_DIR, packageName);
                if (!fs.existsSync(packageOutputDir)) {
                    fs.mkdirSync(packageOutputDir, { recursive: true });
                }
                
                // Save package-specific translations
                const packageFile = path.join(packageOutputDir, 'translations.json');
                fs.writeFileSync(packageFile, JSON.stringify(packageTranslations, null, 2));
                
                const localeCount = Object.keys(packageTranslations).length;
                console.log(`${packageName}: ${localeCount} locales`);
                
                // Track totals
                Object.keys(packageTranslations).forEach(locale => totalLocales.add(locale));
                totalPackages++;
            }
        }
    }
    createConsolidatedIndex();
    
    console.log(`Total: ${totalLocales.size} locales across ${totalPackages} packages`);
    console.log(`Files saved in: ${OUTPUT_DIR}/[package-name]/translations.json`);
}

function createConsolidatedIndex() {
    const consolidatedTranslations = {};
    const packagesInfo = [];
    
    // Read all package translations
    const packageDirs = fs.readdirSync(OUTPUT_DIR).filter(item => {
        const itemPath = path.join(OUTPUT_DIR, item);
        return fs.statSync(itemPath).isDirectory();
    });
    
    for (const packageName of packageDirs) {
        const packageFile = path.join(OUTPUT_DIR, packageName, 'translations.json');
        if (fs.existsSync(packageFile)) {
            try {
                const packageTranslations = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
                packagesInfo.push({
                    name: packageName,
                    locales: Object.keys(packageTranslations).length,
                    file: `${packageName}/translations.json`
                });
                
                // Merge into consolidated
                for (const [locale, translations] of Object.entries(packageTranslations)) {
                    if (!consolidatedTranslations[locale]) {
                        consolidatedTranslations[locale] = {};
                    }
                    Object.assign(consolidatedTranslations[locale], translations);
                }
            } catch (error) {
                console.warn(`Error reading ${packageFile}:`, error.message);
            }
        }
    }
    
    const consolidatedFile = path.join(OUTPUT_DIR, 'translations.json');
    fs.writeFileSync(consolidatedFile, JSON.stringify(consolidatedTranslations, null, 2));
    
    const indexFile = path.join(OUTPUT_DIR, 'packages.json');
    fs.writeFileSync(indexFile, JSON.stringify({
        packages: packagesInfo,
        totalLocales: Object.keys(consolidatedTranslations).length,
        totalPackages: packagesInfo.length,
        generatedAt: new Date().toISOString()
    }, null, 2));
}

function scanPackage(packagePath, translations, packageName) {
    let translationsDir = path.join(packagePath, packageName, 'translations');
    
    if (!fs.existsSync(translationsDir)) {
        translationsDir = path.join(packagePath, 'translations');
    }
    
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
                localeTranslations[`${packageName}:${msgid}`] = msgstr;
            }
            msgid = '';
            msgstr = '';
            inMsgid = false;
            inMsgstr = false;
        }
    }
}

collectTranslations(); 