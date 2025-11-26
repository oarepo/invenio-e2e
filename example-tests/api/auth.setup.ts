import { setupApiTesting } from '../../src';

import path from 'path';

const authFilePath = path.join(__dirname, '../../playwright/.auth/user.json');

setupApiTesting(authFilePath);
