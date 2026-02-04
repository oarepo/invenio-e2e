import { apiTestingCleanup, appConfig } from '@inveniosoftware/invenio-e2e';
import path from 'path';

const authFileAbsolutePath = path.resolve(appConfig.e2eRootPath, '../../', appConfig.authUserFilePath);

apiTestingCleanup(authFileAbsolutePath);
