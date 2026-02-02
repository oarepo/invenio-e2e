import { appConfig } from './env';

export const testConfig = {
    // Load user credentials from environment variables
    userEmail: appConfig.userEmail,
    userPassword: appConfig.userPassword,
    baseURL: appConfig.baseURL,
    dataFolderPath: appConfig.dataFolderPath,
    logXhrRequests: appConfig.logXhrRequests,
};

export type TestConfig = typeof testConfig;
