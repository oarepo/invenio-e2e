import {
  homepageTests,
  test,
  depositionTests,
  loginTests,
  newCommunityTests,
  recordLandingPageTests,
  administrationPageTests,
} from "@inveniosoftware/invenio-e2e";

homepageTests(test);
loginTests(test);
depositionTests(test);
newCommunityTests(test);
recordLandingPageTests(test);
administrationPageTests(test);
