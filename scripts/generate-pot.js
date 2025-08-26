#!/usr/bin/env node

/**
 * Generate POT files using invenio-i18n's create-global-pot command.
 * 
 * This script wraps the core `invenio i18n create-global-pot` command
 * with fallback to direct pybabel extraction if needed.
 * 
 * Usage:
 * - `npm run generate-pot` - Generate POT using invenio i18n create-global-pot
 * - `VENV_PATH=/path/to/venv npm run generate-pot` - Use custom virtual environment
 * - `npm run generate-pot --output path/to/output.pot` - Custom output location
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../src/translations');

/**
 * Find Python virtual environment path
 */
function findVirtualEnv() {
    const explicitPaths = [
        process.env.VENV_PATH,
        process.env.VIRTUAL_ENV
    ].filter(Boolean);
    
    for (const venvPath of explicitPaths) {
        if (isValidVirtualEnv(venvPath)) {
            return { path: venvPath, type: 'explicit' };
        }
    }
    
    const commonPaths = [
        path.resolve(__dirname, '../.venv'),                    // invenio-e2e/.venv
        path.resolve(__dirname, '../../invenio-app-rdm/.venv'), // invenio-app-rdm/.venv
        path.resolve(__dirname, '../../.venv'),                 // parent/.venv
        path.resolve(__dirname, '../../../.venv')               // grandparent/.venv
    ];
    
    for (const venvPath of commonPaths) {
        if (isValidVirtualEnv(venvPath)) {
            return { path: venvPath, type: 'auto-detected' };
        }
    }
    
    return null;
}

/**
 * Check if a path is a valid virtual environment
 */
function isValidVirtualEnv(venvPath) {
    if (!fs.existsSync(venvPath)) return false;
    
    const pythonPath = path.join(venvPath, 'bin', 'python');
    const pyvenvConfig = path.join(venvPath, 'pyvenv.cfg');
    
    return fs.existsSync(pythonPath) && fs.existsSync(pyvenvConfig);
}

/**
 * Get site-packages directory from virtual environment
 */
function getSitePackagesPath(venvPath) {
    const libDir = path.join(venvPath, 'lib');
    if (!fs.existsSync(libDir)) {
        return null;
    }
    
    // Look for Python versions (prioritize newer ones)
    const pythonVersions = ['python3.13', 'python3.12', 'python3.11', 'python3.10', 'python3.9'];
    
    for (const pythonVersion of pythonVersions) {
        const sitePackagesPath = path.join(libDir, pythonVersion, 'site-packages');
        if (fs.existsSync(sitePackagesPath)) {
            return sitePackagesPath;
        }
    }
    
    // Fallback: scan for any python* directory
    const subdirs = fs.readdirSync(libDir);
    for (const subdir of subdirs) {
        if (subdir.startsWith('python')) {
            const sitePackagesPath = path.join(libDir, subdir, 'site-packages');
            if (fs.existsSync(sitePackagesPath)) {
                return sitePackagesPath;
            }
        }
    }
    
    return null;
}

/**
 * Try to use invenio i18n create-global-pot command
 */
function tryInvenioI18nCommand(venvInfo, outputFile) {
    console.log('Trying invenio i18n create-global-pot...');
    
    try {
        const pythonPath = path.join(venvInfo.path, 'bin', 'python');
        const command = `${pythonPath} -m invenio i18n create-global-pot`;
        const args = outputFile ? ` --output "${outputFile}"` : '';
        const fullCommand = `${command}${args}`;
        
        console.log(`Running: ${fullCommand}`);
        
        // Try to find a proper Invenio package directory
        const possibleDirs = [
            path.resolve(__dirname, '../../invenio-app-rdm'),
            path.resolve(__dirname, '../../invenio-rdm-records'),
            path.dirname(venvInfo.path)
        ];
        
        let workingDir = null;
        for (const dir of possibleDirs) {
            if (fs.existsSync(path.join(dir, 'setup.cfg')) || fs.existsSync(path.join(dir, 'pyproject.toml'))) {
                workingDir = dir;
                break;
            }
        }
        
        if (!workingDir) {
            throw new Error('No valid Invenio package directory found');
        }
        
        const result = execSync(fullCommand, { 
            cwd: workingDir,
            encoding: 'utf8',
            env: {
                ...process.env,
                PATH: `${path.dirname(pythonPath)}:${process.env.PATH}`,
                VIRTUAL_ENV: venvInfo.path
            }
        });
        
        console.log('invenio i18n create-global-pot succeeded!');
        return { success: true, output: result };
    } catch (error) {
        console.log('invenio i18n create-global-pot not available, falling back to pybabel...');
        return { success: false, error: error.message };
    }
}

/**
 * Extract strings using pybabel
 */
function extractStringsWithPybabel(sitePackagesPath, outputFile, venvInfo) {
    return new Promise((resolve, reject) => {
        // Find Invenio packages
        const packageDirs = fs
            .readdirSync(sitePackagesPath)
            .filter((name) => name.startsWith('invenio_'))
            .map((name) => path.join(sitePackagesPath, name))
            .filter((fullPath) => fs.statSync(fullPath).isDirectory());

        if (packageDirs.length === 0) {
            return reject(new Error('No Invenio packages found to extract from.'));
        }

        console.log(`Extracting strings from ${packageDirs.length} packages`);
        
        // Standard InvenioRDM translation keywords
        const args = [
            'extract',
            '-o', outputFile,
            '--keyword=_',
            '--keyword=gettext',
            '--keyword=ngettext:1,2',
            '--keyword=lazy_gettext',
            '--keyword=lazy_ngettext:1,2',
            '--keyword=_l',
            '--keyword=_ln:1,2',
            '--keyword=_:1',
            '--keyword=gettext:1',
            '--keyword=ngettext:1,2',
            '--keyword=lazy_pgettext:1c,2',
            '--keyword=pgettext:1c,2',
            '--keyword=npgettext:1c,2,3',
            '--add-comments=TRANSLATORS:',
            '--add-comments=NOTE:',
            '--sort-by-file',
            '--no-wrap',
            ...packageDirs
        ];
        
        const pythonPath = path.join(venvInfo.path, 'bin', 'python');
        const command = pythonPath;
        const commandArgs = ['-m', 'babel.messages.frontend', ...args];
        
        const pybabel = spawn(command, commandArgs, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                PATH: `${path.dirname(pythonPath)}:${process.env.PATH}`,
                VIRTUAL_ENV: venvInfo.path
            }
        });
        
        let stdout = '';
        let stderr = '';
        
        pybabel.stdout.on('data', (data) => stdout += data.toString());
        pybabel.stderr.on('data', (data) => stderr += data.toString());
        
        pybabel.on('close', (code) => {
            if (code === 0) {
                console.log('POT file generated successfully');
                resolve();
            } else {
                reject(new Error(`pybabel failed: ${stderr}`));
            }
        });
        
        pybabel.on('error', (error) => {
            reject(new Error(`pybabel not found. Please install Babel: uv add babel`));
        });
    });
}

/**
 * Parse POT file and extract msgid entries
 */
function parsePotFile(potFilePath) {
    const content = fs.readFileSync(potFilePath, 'utf8');
    const lines = content.split('\n');
    const msgids = [];
    
    let currentMsgid = '';
    let inMsgid = false;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('msgid ')) {
            currentMsgid = trimmed.substring(6).replace(/^"(.*)"$/, '$1');
            inMsgid = true;
        } else if (inMsgid && trimmed.startsWith('"') && trimmed.endsWith('"')) {
            currentMsgid += trimmed.replace(/^"(.*)"$/, '$1');
        } else if (trimmed.startsWith('msgstr ') || trimmed === '') {
            if (currentMsgid && currentMsgid !== '') {
                msgids.push(currentMsgid);
            }
            currentMsgid = '';
            inMsgid = false;
        }
    }
    
    return msgids;
}

/**
 * Generate comparison report between POT and existing translations
 */
function generateComparisonReport(potMsgids, translationsPath) {
    const report = {
        generatedAt: new Date().toISOString(),
        potFile: {
            totalStrings: potMsgids.length,
            strings: potMsgids
        },
        locales: {}
    };
    
    const translationsFile = path.join(translationsPath, 'translations.json');
    if (fs.existsSync(translationsFile)) {
        const translations = JSON.parse(fs.readFileSync(translationsFile, 'utf8'));
        
        for (const [locale, localeTranslations] of Object.entries(translations)) {
            const translatedKeys = Object.keys(localeTranslations);
            const missingInPot = translatedKeys.filter(key => !potMsgids.includes(key));
            const missingInLocale = potMsgids.filter(key => !translatedKeys.includes(key));
            
            report.locales[locale] = {
                totalTranslations: translatedKeys.length,
                missingFromPot: missingInPot,
                missingFromLocale: missingInLocale,
                coveragePercentage: Math.round((translatedKeys.length / potMsgids.length) * 100)
            };
        }
    }
    
    return report;
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    const outputIndex = args.indexOf('--output');
    const customOutput = outputIndex !== -1 ? args[outputIndex + 1] : null;
    
    console.log('POT Generation: invenio i18n create-global-pot');
    console.log('===================================================');
    
    const venvInfo = findVirtualEnv();
    if (!venvInfo) {
        console.error('Virtual environment not found!');
        console.error('Please set VENV_PATH or create a .venv in an Invenio package directory.');
        process.exit(1);
    }
    
    console.log(`Using virtual environment: ${venvInfo.path}`);
    
    const outputFile = customOutput || path.join(OUTPUT_DIR, 'messages.pot');
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    
    // invenio i18n create-global-pot first
    const invenioResult = tryInvenioI18nCommand(venvInfo, outputFile);
    if (invenioResult.success) {
        console.log(`Output: ${outputFile}`);
        console.log('Used core invenio-i18n create-global-pot command');
        
        const potMsgids = parsePotFile(outputFile);
        console.log(`Extracted ${potMsgids.length} translatable strings`);
        return;
    }
    
    // fallback to pybabel
    console.log('Falling back to direct pybabel extraction...');
    
    const sitePackagesPath = getSitePackagesPath(venvInfo.path);
    if (!sitePackagesPath) {
        console.error(`Site-packages directory not found in: ${venvInfo.path}`);
        process.exit(1);
    }
    
    console.log(`Site-packages path: ${sitePackagesPath}`);
    
    await extractStringsWithPybabel(sitePackagesPath, outputFile, venvInfo);
    
    const potMsgids = parsePotFile(outputFile);
    console.log(`Extracted ${potMsgids.length} translatable strings`);
    
    const comparisonReport = generateComparisonReport(potMsgids, OUTPUT_DIR);
    const reportFile = path.join(OUTPUT_DIR, 'pot-comparison-report.json');
    fs.writeFileSync(reportFile, JSON.stringify(comparisonReport, null, 2));
    
    console.log('\nComparison Report:');
    console.log(`  POT strings: ${comparisonReport.potFile.totalStrings}`);
    for (const [locale, localeInfo] of Object.entries(comparisonReport.locales)) {
        console.log(`  ${locale}: ${localeInfo.totalTranslations} translations (${localeInfo.coveragePercentage}% coverage)`);
        if (localeInfo.missingFromLocale.length > 0) {
            console.log(`    Missing ${localeInfo.missingFromLocale.length} translations`);
        }
    }
    
    console.log(`\nFiles generated:`);
    console.log(`  POT file: ${outputFile}`);
    console.log(`  Comparison report: ${reportFile}`);
}

main().catch(console.error);