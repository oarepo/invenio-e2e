import { InvenioTest } from '../../fixtures';
import { test_if_not_skipped } from './utils';

export function uploadTests(test: InvenioTest, options: { skip?: string[] } = {}) {
  console.log('uploadTests: running with options.skip =', options.skip);

  const runner = test_if_not_skipped(test, "Upload Tests", options.skip);

  if (!runner) {
    console.log('uploadTests: runner is undefined, skipping whole suite');
    return;
  }

  test.describe('Upload Tests', () => {
    console.log('uploadTests: inside describe block');
    runner('Upload a file', async ({ depositPage }) => {
      console.log('Running upload file test...');
      await depositPage.openPage();
      await depositPage.uploadRandomFile();
    });
  });
}