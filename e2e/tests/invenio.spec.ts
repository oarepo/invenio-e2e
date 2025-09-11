import { homepageTests, test, depositionTests, loginTests } from '@inveniosoftware/invenio-e2e';

homepageTests(test);
loginTests(test);
depositionTests(test);
