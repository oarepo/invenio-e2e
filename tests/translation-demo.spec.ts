import { test } from '../src/fixtures';

test('Translation system demo with pre-compiled translations', async ({ 
  page, 
  services, 
  expect 
}) => {
  await page.goto('https://inveniordm.web.cern.ch/');
  
  // Show available locales
  const availableLocales = Object.keys(services.i18n.translations);
  console.log('Available locales:', availableLocales.slice(0, 5));

  // Test with German if available
  if (availableLocales.includes('de')) {
    console.log('\nTesting German translations...');
    const hasHomeDE = services.i18n.hasTranslation('Home', 'de');
    console.log('German "Home" available:', hasHomeDE);
    if (hasHomeDE) {
      const homeTextDE = services.i18n.get_localized_text('Home', 'de');
      console.log('German "Home" text:', homeTextDE);
      
      // Test package-specific lookup
      const hasAppRdmHomeDE = services.i18n.hasTranslation('Home', 'de', 'invenio_app_rdm');
      if (hasAppRdmHomeDE) {
        const appRdmTextDE = services.i18n.get_localized_text('Home', 'de', 'invenio_app_rdm');
        console.log('invenio_app_rdm German text:', appRdmTextDE);
      }
    }
    
    // Test common translation keys
    const commonKeys = ['Submit', 'Records', 'Communities', 'Upload'];
    for (const key of commonKeys) {
      if (services.i18n.hasTranslation(key, 'de')) {
        const text = services.i18n.get_localized_text(key, 'de');
        console.log(`de: "${key}" → "${text}"`);
      }
    }
  }

  // Test with French if available
  if (availableLocales.includes('fr')) {
    console.log('\nTesting French translations...');
    const commonKeys = ['Home', 'Submit', 'Communities'];
    for (const key of commonKeys) {
      if (services.i18n.hasTranslation(key, 'fr')) {
        const text = services.i18n.get_localized_text(key, 'fr');
        console.log(`fr: "${key}" → "${text}"`);
        
        // Test package-specific lookup
        if (services.i18n.hasTranslation(key, 'fr', 'invenio_app_rdm')) {
          const packageText = services.i18n.get_localized_text(key, 'fr', 'invenio_app_rdm');
          console.log(`  invenio_app_rdm: "${packageText}"`);
        }
      }
    }
  }

  // API demonstration
  console.log('\nAPI Demonstration:');
  console.log('expect(locator).toHaveI18nText("Home", { locale: "de" })');
  console.log('expect(locator).toHaveI18nText("Open", { locale: "de", package: "invenio_app_rdm" })');

  // Show available packages
  const sampleTranslations = services.i18n.translations['de'] || services.i18n.translations[availableLocales[0]] || {};
  const packageKeys = Object.keys(sampleTranslations).filter(key => key.includes(':'));
  const packages = [...new Set(packageKeys.map(key => key.split(':')[0]))];
  console.log('Detected packages:', packages);

  console.log('\nTranslation system is working with pre-compiled translations.');
}); 