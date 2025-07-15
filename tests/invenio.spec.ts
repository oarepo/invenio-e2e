import { test } from '../src/fixtures';

import { homepageTests } from '../src/tests/e2e/homepage';

// Register the homepage tests to be run when the test suite is executed
homepageTests(test);