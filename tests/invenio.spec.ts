import { test } from '../src/fixtures';

import { homepageTests, loginTests } from '../src/tests/e2e';

// Run all tests
homepageTests(test);
loginTests(test);

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
