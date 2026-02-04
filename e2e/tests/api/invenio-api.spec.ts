import { test, recordsApiTests, appConfig } from "@inveniosoftware/invenio-e2e";
import path from 'path';

const authUserFilePath = path.resolve(appConfig.e2eRootPath, '../../', appConfig.authUserFilePath);

// Run all API tests by calling the function with the test instance and other parameters

recordsApiTests(test, authUserFilePath);

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
