import { test as invenio_test, registerPage, updateLocators } from '@inveniosoftware/invenio-e2e';

import { locators } from '../locators';

export const test = invenio_test.extend({
  // Replace the locators within invenio-e2e with customized ones
  locators: updateLocators(locators),
});
