import { test, recordsApiTests } from "@inveniosoftware/invenio-e2e";

// Run all API tests by calling the function with the test instance and other parameters

recordsApiTests(test);

/*
 * To skip some tests inside the default test suite, you can use the `skipTests` method:
 * 
 *
 * test.skipTests(['Should display the homepage logo'], () => {
 *   // This will skip the test with the title 'Should display the homepage logo'
 *   homepageTests(test);
 *   loginTests(test);
 * })
 *  
 */
