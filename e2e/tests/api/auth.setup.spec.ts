import { setupApiTesting, appConfig } from '@inveniosoftware/invenio-e2e';


import path from 'path';

// TODO: fix this
const authFileAbsolutePath = path.resolve(__dirname, '../../', appConfig.authUserFilePath);

setupApiTesting(authFileAbsolutePath);
