import { authenticateUserForApiTesting, appConfig } from '@inveniosoftware/invenio-e2e';
import path from 'path';

const userAuthFileAbsolutePath = path.resolve(appConfig.e2eRootPath, appConfig.authUserFilePath);
const adminAuthFileAbsolutePath = path.resolve(appConfig.e2eRootPath, appConfig.authAdminFilePath);

authenticateUserForApiTesting(appConfig.userEmail, appConfig.userPassword, userAuthFileAbsolutePath);
authenticateUserForApiTesting(appConfig.adminEmail, appConfig.adminPassword, adminAuthFileAbsolutePath);
