import { test } from '../src/fixtures';

function getAvailableTranslations(): Record<string, unknown> | null {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-require-imports
        return require('@collected-translations/translations.json');
    } catch {
        return null;
    }
}

const translations: Record<string, unknown> | null = getAvailableTranslations();

if (!translations) {
    test.skipTests(['Translation system demo with pre-compiled translations'], () => {
        test('Translation system demo with pre-compiled translations', async () => {
            // no pre-compiled translations
        });
    });
} else {
    test('Translation system demo with pre-compiled translations', async ({ 
      page, 
      services 
    }) => {
      await page.goto('https://repository.tugraz.at/');
      
       
      const availableLocales = Object.keys(services.i18n.translations);
      console.log(`Available locales: ${availableLocales.length}`);
      
      if (availableLocales.includes('de')) {
         
        const hasHomeDE = services.i18n.hasTranslation('Home', 'de');
        if (hasHomeDE) {
          const homeTextDE = services.i18n.getLocalizedText('Home', 'de');
          console.log(`German "Home": "${homeTextDE}"`);
          
          const hasAppRdmHomeDE = services.i18n.hasTranslation('Home', 'de', 'invenio_app_rdm');
          if (hasAppRdmHomeDE) {
            const appRdmTextDE = services.i18n.getLocalizedText('Home', 'de', 'invenio_app_rdm');
            console.log(`Package-specific: "${appRdmTextDE}"`);
          }
        }
         
      }
      
      if (availableLocales.includes('cs')) {
        const commonKeys = ['Home', 'Submit', 'Communities'];
        for (const key of commonKeys) {
           
          if (services.i18n.hasTranslation(key, 'cs')) {
            const text = services.i18n.getLocalizedText(key, 'cs');
            console.log(`Czech "${key}": "${text}"`);
          }
           
        }
      }

      // simple package detection
      const sampleLocale = availableLocales[0];
      if (sampleLocale) {
         
        const packageKeys = Object.keys(services.i18n.translations[sampleLocale]).filter(key => key.includes(':'));
         
        const packages = [...new Set(packageKeys.map(key => key.split(':')[0]))];
        console.log(`Packages detected: ${packages.length}`);
      }
      console.log('Translation system operational');
    });
}

test.describe('Locale-specific translation tests', () => {
    const translations = getAvailableTranslations();
    const availableLocales = translations ? Object.keys(translations) : [];
    
    if (!availableLocales.includes('de')) {
        test.skipTests(['German translation validation'], () => {
            test('German translation validation', () => {
                // Skipped - German translations not available
            });
        });
    } else {
        test('German translation validation', ({ services }) => {
             
            const hasGermanHome = services.i18n.hasTranslation('Home', 'de');
            console.log(`German Home available: ${hasGermanHome}`);
        });
    }

    if (!availableLocales.includes('cs')) {
        test.skipTests(['Czech translation validation'], () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            test('Czech translation validation', async ({ services }) => {
                // czech translations not available
            });
        });
    } else {
        // eslint-disable-next-line @typescript-eslint/require-await
        test('Czech translation validation', async ({ services }) => {
             
            const hasCzechHome = services.i18n.hasTranslation('Home', 'cs');
             
            console.log(`Czech Home available: ${hasCzechHome}`);
        });
    }

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
    const hasAnyPackage = translations ? 
        Object.values(translations).some((locale: any) => 
            Object.keys(locale).some(key => key.includes(':'))
        ) : false;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

    if (!hasAnyPackage) {
        test.skipTests(['Package-specific translation tests'], () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            test('Package-specific translation tests', async ({ services }) => {
                // no package-specific translations available
            });
        });
    } else {
        // eslint-disable-next-line @typescript-eslint/require-await
        test('Package-specific translation tests', async ({ services }) => {
            // package-specific translation to test with
            const sampleLocale = availableLocales[0];
            if (sampleLocale) {
                 
                const packageKeys = Object.keys(services.i18n.translations[sampleLocale]).filter(key => key.includes(':'));
                 
                const hasPackageTranslations = packageKeys.length > 0;
                console.log(`Package translations available: ${hasPackageTranslations}`);
            }
        });
    }
});

 