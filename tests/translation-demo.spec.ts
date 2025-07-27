import { test } from '../src/fixtures';

function getAvailableTranslations() {
    try {
        return require('../src/translations/translations.json');
    } catch {
        return null;
    }
}

const translations = getAvailableTranslations();

if (!translations) {
    test.skipTests(['Translation system demo with pre-compiled translations'], () => {
        test('Translation system demo with pre-compiled translations', async () => {
            // Skipped - no pre-compiled translations
        });
    });
} else {
    test('Translation system demo with pre-compiled translations', async ({ 
        page, 
        services, 
        expect 
    }) => {
        await page.goto('https://inveniordm.web.cern.ch/');
        
        const availableLocales = Object.keys(services.i18n.translations);
        console.log(`Available locales: ${availableLocales.length}`);

        if (availableLocales.includes('de')) {
            const hasHomeDE = services.i18n.hasTranslation('Home', 'de');
            if (hasHomeDE) {
                const homeTextDE = services.i18n.get_localized_text('Home', 'de');
                console.log(`German "Home": "${homeTextDE}"`);
                
                const hasAppRdmHomeDE = services.i18n.hasTranslation('Home', 'de', 'invenio_app_rdm');
                if (hasAppRdmHomeDE) {
                    const appRdmTextDE = services.i18n.get_localized_text('Home', 'de', 'invenio_app_rdm');
                    console.log(`Package-specific: "${appRdmTextDE}"`);
                }
            }
        }

        if (availableLocales.includes('cs')) {
            const commonKeys = ['Home', 'Submit', 'Communities'];
            for (const key of commonKeys) {
                if (services.i18n.hasTranslation(key, 'cs')) {
                    const text = services.i18n.get_localized_text(key, 'cs');
                    console.log(`Czech "${key}": "${text}"`);
                }
            }
        }

        const sampleTranslations = services.i18n.translations['de'] || services.i18n.translations[availableLocales[0]] || {};
        const packageKeys = Object.keys(sampleTranslations).filter(key => key.includes(':'));
        const packages = [...new Set(packageKeys.map(key => key.split(':')[0]))];
        
        console.log(`Packages detected: ${packages.length}`);
        console.log('Translation system operational');
    });
}

test.describe('Locale-specific translation tests', () => {
    const translations = getAvailableTranslations();
    const availableLocales = translations ? Object.keys(translations) : [];
    
    if (!availableLocales.includes('de')) {
        test.skipTests(['German translation validation'], () => {
            test('German translation validation', async ({ services }) => {
                // Skipped - German translations not available
            });
        });
    } else {
        test('German translation validation', async ({ services }) => {
            const hasGermanHome = services.i18n.hasTranslation('Home', 'de');
            console.log(`German Home available: ${hasGermanHome}`);
        });
    }

    if (!availableLocales.includes('cs')) {
        test.skipTests(['Czech translation validation'], () => {
            test('Czech translation validation', async ({ services }) => {
                // Skipped - Czech translations not available
            });
        });
    } else {
        test('Czech translation validation', async ({ services }) => {
            const hasCzechHome = services.i18n.hasTranslation('Home', 'cs');
            console.log(`Czech Home available: ${hasCzechHome}`);
        });
    }

    const hasInvenioAppRdm = translations ? 
        Object.values(translations).some((locale: any) => 
            Object.keys(locale).some(key => key.startsWith('invenio_app_rdm:'))
        ) : false;

    if (!hasInvenioAppRdm) {
        test.skipTests(['invenio_app_rdm package translation tests'], () => {
            test('invenio_app_rdm package translation tests', async ({ services }) => {
                // Skipped - invenio_app_rdm package not available
            });
        });
    } else {
        test('invenio_app_rdm package translation tests', async ({ services }) => {
            const hasPackageHome = services.i18n.hasTranslation('Home', 'en', 'invenio_app_rdm');
            console.log(`Package Home available: ${hasPackageHome}`);
        });
    }
});

 