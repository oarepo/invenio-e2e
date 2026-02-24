import { appConfig } from './env';

export const testConfig = {
    // Load user credentials from environment variables
    userEmail: appConfig.userEmail,
    userPassword: appConfig.userPassword,
    adminEmail: appConfig.adminEmail,
    adminPassword: appConfig.adminPassword,
    baseURL: appConfig.baseURL,
    dataFolderPath: appConfig.dataFolderPath,
};

export type TestConfig = typeof testConfig;
