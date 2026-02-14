import { apiTestingCleanup, appConfig } from '@inveniosoftware/invenio-e2e';
import path from 'path';

const userAuthFileAbsolutePath = path.resolve(appConfig.e2eRootPath, appConfig.authUserFilePath);
const adminAuthFileAbsolutePath = path.resolve(appConfig.e2eRootPath, appConfig.authAdminFilePath);

apiTestingCleanup(appConfig.userEmail, userAuthFileAbsolutePath);
apiTestingCleanup(appConfig.adminEmail, adminAuthFileAbsolutePath);
