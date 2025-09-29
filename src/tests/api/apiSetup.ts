import { test as setup } from '../../fixtures';
import { expect } from '@playwright/test';

import path from 'path';

export function setupApiTesting(authFilePath?: string) {
  authFilePath = authFilePath ?? path.join(__dirname, '../../../playwright/.auth/user.json');

  setup('Authentication for API Testing', async ({ loginPage, homePage, page }) => {
    await homePage.openPage();
    const loggedInHomePage = await homePage.login();
    expect(loggedInHomePage).toBe(homePage);
    // End of authentication steps.

    // Save the authenticated context
    await page.context().storageState({ path: authFilePath });
  });
};
