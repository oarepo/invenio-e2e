import { homepageTests, test, depositionTests, loginTests } from '@inveniosoftware/invenio-e2e';
import { newCommunityTests } from '@inveniosoftware/invenio-e2e/src/tests/e2e';
import { recordLandingPageTests } from '@inveniosoftware/invenio-e2e/src/tests/e2e';

homepageTests(test);
loginTests(test);
depositionTests(test);
newCommunityTests(test);
recordLandingPageTests(test);