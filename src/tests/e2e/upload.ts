import { InvenioTest } from '../../fixtures';

export function uploadTests(test: InvenioTest) {
  // If Upload Tests are skipped, return early

  test.describe('Upload Tests', () => {
    console.log('uploadTests: inside describe block');
    test('Upload a file', async ({ depositPage }) => {
      console.log('Running upload file test...');
      await depositPage.openPage();
      await depositPage.uploadRandomFile();
    });
  });
}