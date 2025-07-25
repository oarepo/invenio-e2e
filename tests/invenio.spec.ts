import { test } from '../src/fixtures';

import { homepageTests, loginTests } from '../src/tests/e2e';

// Register the homepage tests to be run when the test suite is executed
homepageTests(test);
loginTests(test);