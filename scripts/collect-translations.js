#!/usr/bin/env node

/**
 * Collect translations from Invenio packages into package-specific JSON files.
 * 
 * 
 * Package Location: the script looks for packages in the following locations - in order:
 * environment variable INVENIO_PACKAGES_DIR if set
 * parent directory of invenio-e2e (../../package-name)
 * current directory (./package-name)
 * 
 * Installation Scenarios:
 * - clone packages alongside invenio-e2e in parent directory
 * - NPM package: Set INVENIO_PACKAGES_DIR to point to your packages location
 * - instance: Use relative path from your RDM instance structure
 * 
 */

const fs = require('fs');
const path = require('path');

// TODO: consider passing this as an argument
const OUTPUT_DIR = path.join('translations');

/**
 * Find package in multiple fallback locations.
 */
function resolvePackagePath(packageName) {
    const locations = [
        process.env.INVENIO_PACKAGES_DIR && path.join(process.env.INVENIO_PACKAGES_DIR, packageName),
        path.resolve(__dirname, '../..', packageName),
        path.resolve(__dirname, '..', packageName)
    ].filter(Boolean);
    
    return locations.find(fs.existsSync) || null;
}

/**
 * Parses a .po file using the i18next-conv library and converts it to our translation format.
 * 
 * This function uses the established i18next-conv library to handle edge cases in .po file parsing
 * such as validity checks, duplicates, and proper encoding handling. 
 * 
 * @param {string} poFilePath - Path to the .po file to parse
 * @param {string} packageName - Name of the package (used for namespacing translations)
 * @returns {Promise<Object>} Object containing translations with both flat keys and package-scoped keys
 * 
 * @example
 * // For a key "Home" in package "invenio_app_rdm", this will create:
 * {
 *   "Home": "Startseite",
 *   "invenio_app_rdm:Home": "Startseite"
 * }
 */
async function parsePoFile(poFilePath, packageName) {
    try {
        const { gettextToI18next } = await import('i18next-conv');
        const poContent = fs.readFileSync(poFilePath, 'utf8');
        
        const result = await gettextToI18next('', poContent, {
            skipUntranslated: true,
            compatibilityJSON: 'v4'
        });
        
        const translations = JSON.parse(result);
        const output = {};
        
        // Store translations with both flat keys and package-scoped keys
        for (const [key, value] of Object.entries(translations)) {
            if (key && value && typeof value === 'string') {
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
 * Scans an Invenio package directory for translation files and extracts all translations.
 * 
 * This function looks for translations in the standard Invenio directory structure:
 * - First tries: packagePath/packageName/translations/
 * - Falls back to: packagePath/translations/
 * 
 * Within the translations directory, it scans for locale subdirectories containing
 * LC_MESSAGES/messages.po files following the GNU gettext convention.
 * 
 * @param {string} packagePath - Path to the package directory
 * @param {string} packageName - Name of the package (used for namespacing)
 * @returns {Promise<Object>} Object mapping locale codes to their translations
 * 
 * @example
 * // Returns structure like:
 * {
 *   "en": { "Home": "Home", "invenio_app_rdm:Home": "Home" },
 *   "de": { "Home": "Startseite", "invenio_app_rdm:Home": "Startseite" }
 * }
 */
async function scanPackage(packagePath, packageName) {
    const translations = {};
    
    // Try standard Invenio structure first, then fallback
    let translationsDir = path.join(packagePath, packageName, 'translations');
    if (!fs.existsSync(translationsDir)) {
        translationsDir = path.join(packagePath, 'translations');
    }
    
    if (!fs.existsSync(translationsDir)) {
        return translations;
    }
    
    // Scan locale directories
    const locales = fs.readdirSync(translationsDir);
    for (const locale of locales) {
        const localePath = path.join(translationsDir, locale);
        if (fs.statSync(localePath).isDirectory()) {
            const poFile = path.join(localePath, 'LC_MESSAGES/messages.po');
            if (fs.existsSync(poFile)) {
                translations[locale] = await parsePoFile(poFile, packageName);
            }
        }
    }
    
    return translations;
}

/**
 * Main function that collects translations from Invenio packages.
 * 
 * Uses the pre-processing approach - we parse .po files once at build time
 * 
 * Creates two outputs:
 * - Individual package translation files (src/translations/package_name/)
 * - One combined file with everything (src/translations/translations.json)
 * 
 * Command line usage:
 * - `npm run collect-translations` - Uses default packages (invenio-app-rdm, invenio-rdm-records)
 * - `npm run collect-translations package1 package2` - Collects from specified packages
 * - `INVENIO_PACKAGES_DIR=/path/to/packages npm run collect-translations` - Collects from packages in the specified directory
 * 
 * Output structure:
 * ```
 * src/translations/
 * ├── translations.json              # translations from all packages
 * ├── invenio_app_rdm/
 * │   └── translations.json          # package-specific translations
 * └── repository_tugraz/
 *     └── translations.json          # package-specific translations
 * ```
 * 
 */
async function main() {
    const args = process.argv.slice(2);
    const packages = args.length > 0 ? args : ['invenio-app-rdm', 'invenio-rdm-records'];
    
    console.log(`Collecting translations from ${args.length > 0 ? 'specified' : 'default'} packages`);
    
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    
    const allTranslations = {};
    let packageCount = 0;
    
    for (const pkg of packages) {
        const packagePath = resolvePackagePath(pkg);
        if (!packagePath) {
            console.warn(`Package not found: ${pkg}`);
            console.warn('Tried locations:');
            if (process.env.INVENIO_PACKAGES_DIR) {
                console.warn(`  - ${path.join(process.env.INVENIO_PACKAGES_DIR, pkg)}`);
            }
            console.warn(`  - ${path.resolve(__dirname, '../..', pkg)}`);
            console.warn(`  - ${path.resolve(__dirname, '..', pkg)}`);
            continue;
        }
        
        const packageName = pkg.replace(/-/g, '_');
        const translations = await scanPackage(packagePath, packageName);
        
        if (Object.keys(translations).length === 0) continue;
        
        // save package-specific file
        const packageDir = path.join(OUTPUT_DIR, packageName);
        fs.mkdirSync(packageDir, { recursive: true });
        fs.writeFileSync(
            path.join(packageDir, 'translations.json'),
            JSON.stringify(translations, null, 2)
        );
        
        // merge into consolidated translations
        for (const [locale, localeTranslations] of Object.entries(translations)) {
            if (!allTranslations[locale]) allTranslations[locale] = {};
            Object.assign(allTranslations[locale], localeTranslations);
        }
        
        console.log(`${packageName}: ${Object.keys(translations).length} locales (${packagePath})`);
        packageCount++;
    }
    
    // save consolidated file
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'translations.json'),
        JSON.stringify(allTranslations, null, 2)
    );
    
    const totalLocales = Object.keys(allTranslations).length;
    console.log(`Total: ${totalLocales} locales across ${packageCount} packages`);
}

main().catch(console.error); 