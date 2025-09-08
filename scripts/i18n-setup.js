#!/usr/bin/env node

/**
 * Complete i18n setup workflow for InvenioRDM E2E testing.
 * 
 * This script demonstrates the full pre-processing workflow:
 * - Collects translations from Invenio packages
 * - Builds the project with translations included
 * 
 * Usage:
 *   npm run i18n-setup                          # use default packages
 *   npm run i18n-setup repository-tugraz        # specific package
 *   npm run i18n-setup package1 package2        # multiple packages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, description) {
    console.log(`\n${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✓ ${description} completed`);
    } catch (error) {
        console.error(`✗ ${description} failed`);
        process.exit(1);
    }
}

function getStats() {
    const translationsFile = path.join(__dirname, '../src/translations/translations.json');
    
    if (!fs.existsSync(translationsFile)) {
        return null;
    }
    
    try {
        const translations = JSON.parse(fs.readFileSync(translationsFile, 'utf8'));
        const locales = Object.keys(translations);
        const fileSize = fs.statSync(translationsFile);
        
        return {
            locales: locales.length,
            size: (fileSize.size / 1024).toFixed(1) + ' KB'
        };
    } catch {
        return null;
    }
}

function main() {
    console.log('InvenioRDM i18n Setup');
    console.log('========================');
    
    // Collect translations
    const packages = process.argv.slice(2);
    const collectCmd = packages.length > 0 
        ? `npm run collect-translations ${packages.join(' ')}`
        : 'npm run collect-translations';
    
    run(collectCmd, 'Collecting translations');
    
    // Build project
    run('npm run build', 'Building project');
    
}

main(); 