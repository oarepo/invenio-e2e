import { test } from "../../src/fixtures";
import { recordsApiTests } from '../../src/tests/api';
import { appConfig } from "../../src/config/env";

import type { BrowserContext } from "@playwright/test";
import { readFileSync } from 'fs';
import path from 'path';

const authUserFilePath = process.env.AUTH_USER_FILE || path.join(__dirname, '../../playwright/.auth/user.json');
const authUserFile = JSON.parse(readFileSync(authUserFilePath, 'utf-8')) as Awaited<ReturnType<BrowserContext['storageState']>>;

test.use({
  storageState: authUserFilePath,
  extraHTTPHeaders: {
    'X-CSRFToken': authUserFile.cookies.find(cookie => cookie.name === 'csrftoken')?.value || '',
    'Referer': appConfig.baseURL || 'https://127.0.0.1:5000',
  },
});


// Run all API tests by calling the function with the test instance

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
