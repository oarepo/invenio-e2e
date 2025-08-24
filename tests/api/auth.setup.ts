import { test as setup } from '../../src/fixtures';
import { expect } from '@playwright/test';

import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('Authentication for API Testing', async ({ loginPage, homePage }) => {
  await homePage.openPage();
  const loggedInHomePage = await homePage.login();
  expect(loggedInHomePage).toBe(homePage);
  // End of authentication steps.

  // Save the authenticated context
  await homePage.page.context().storageState({ path: authFile });
});
