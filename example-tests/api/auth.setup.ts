import { appConfig, setupApiTesting } from '../../src';

import path from 'path';

const authFileAbsolutePath = path.resolve(__dirname, '../../', appConfig.authUserFilePath);

setupApiTesting(authFileAbsolutePath);
