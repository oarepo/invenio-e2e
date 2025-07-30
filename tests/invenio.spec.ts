import { test } from '../src/fixtures';

import { homepageTests, loginTests } from '../src/tests/e2e';
import { uploadTests } from '../src/tests/e2e/upload';
import { homepageTests } from '../src/tests/e2e/homepage';

// Run all tests
// Register the homepage tests to be run when the test suite is executed
console.log('Registering homepageTests');
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


console.log('Registering uploadTests');
uploadTests(test);