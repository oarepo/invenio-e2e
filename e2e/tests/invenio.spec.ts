import { homepageTests, test, depositionTests, loginTests } from '@inveniosoftware/invenio-e2e';
import { newCommunityTests } from '@inveniosoftware/invenio-e2e/src/tests/e2e';
import { recordLandingPageTests } from '@inveniosoftware/invenio-e2e/src/tests/e2e';
import { communityMembersTests, communityRolesTests, recordsCrudTests, recordLandingExtrasTests, communityRequestsTests, communitySettingsTests, communityMemberVisibilityTests, communityFiltersTests, recordAccessTests } from '@inveniosoftware/invenio-e2e/src/tests/e2e';

homepageTests(test);
loginTests(test);
depositionTests(test);
newCommunityTests(test);
recordLandingPageTests(test);
communityMembersTests(test);
communityRolesTests(test);
recordsCrudTests(test);
recordLandingExtrasTests(test);
communityRequestsTests(test);
communitySettingsTests(test);
communityMemberVisibilityTests(test);
communityFiltersTests(test);
recordAccessTests(test);