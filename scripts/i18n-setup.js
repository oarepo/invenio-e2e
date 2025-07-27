#!/usr/bin/env node

/**
 * Demonstrate i18n pre-processing workflow with translation collection and testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(__dirname, '../src/translations/translations.json');

function runCommand(command, description) {
    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`${description} completed`);
        return output;
    } catch (error) {
        console.error(`${description} failed:`, error.message);
        return null;
    }
}

function checkTranslationsExist() {
    return fs.existsSync(TRANSLATIONS_FILE);
}

function getTranslationStats() {
    if (!checkTranslationsExist()) {
        return null;
    }
    
    try {
        const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_FILE, 'utf8'));
        const locales = Object.keys(translations);
        const sampleLocale = translations[locales[0]] || {};
        const packageKeys = Object.keys(sampleLocale).filter(key => key.includes(':'));
        const packages = [...new Set(packageKeys.map(key => key.split(':')[0]))];
        
        return {
            locales: locales.length,
            packages: packages.length,
            packageNames: packages
        };
    } catch (error) {
        console.error('Error reading translations:', error.message);
        return null;
    }
}

function main() {
    console.log('InvenioRDM i18n Pre-processing Workflow');
    console.log('=======================================');
    
    const initialExists = checkTranslationsExist();
    console.log(`Initial translations: ${initialExists ? 'Found' : 'Not found'}`);
    
    if (initialExists) {
        const stats = getTranslationStats();
        if (stats) {
            console.log(`Locales: ${stats.locales}, Packages: ${stats.packages}`);
        }
    }
    
    const args = process.argv.slice(2);
    let collectCommand = 'npm run collect-translations';
    
    if (args.length > 0) {
        collectCommand += ` ${args.join(' ')}`;
    }
    
    const collectOutput = runCommand(collectCommand, 'Collecting translations');
    
    const finalExists = checkTranslationsExist();
    
    if (finalExists) {
        const stats = getTranslationStats();
        if (stats) {
            console.log('Collection successful');
            console.log(`File: ${TRANSLATIONS_FILE}`);
            console.log(`Locales: ${stats.locales}, Packages: ${stats.packages}`);
            
            const fileStats = fs.statSync(TRANSLATIONS_FILE);
            const fileSizeKB = (fileStats.size / 1024).toFixed(1);
            console.log(`File size: ${fileSizeKB} KB`);
        }
    } else {
        console.log('Collection failed - no output file generated');
        return;
    }
    
    runCommand('npm run build', 'Building project');
    console.log('\nReady for testing');
}

main(); 