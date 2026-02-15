import * as dotenv from "dotenv";
import path from "path";

export interface QaseReporterConfig {
  apiToken: string;
  projectCode: string;
  runName: string;
  environment: string;
  rootSuiteTitle: string;
  runComplete: boolean;
}

const ENV = process.env.ENV || "dev";
dotenv.config({ path: path.resolve(__dirname, `../.env.${ENV}`) });

/**
 * Application configuration assembled from environment variables.
 *
 * Defaults to local development values when relevant environment variables
 * are not provided.
 * @property baseURL - Base URL of the tested application.
 * @property e2eRootPath - Root path for end-to-end tests.
 * @property userEmail - Login email for authentication in the tested application.
 * @property userPassword - Login password for authentication in the tested application.
 * @property authUserFilePath - Path (relative to project root) to the file where the authenticated user state is stored.
 * @property adminEmail - Login email for admin authentication in the tested application (for tests that require admin privileges).
 * @property adminPassword - Login password for admin authentication in the tested application (for tests that require admin privileges).
 * @property authAdminFilePath - Path (relative to project root) to the file where the authenticated admin state is stored.
 * @property dataFolderPath - Path (relative to project root) to the folder where test data files are stored.
 * @property s3DefaultBlockSize - Default block size in bytes for multipart uploads to S3-compatible storage.
 * @property qase - Configuration options for Qase TestOps integration. See {@link https://developers.qase.io/docs/configuration-options Qase Configuration Options}.
 * @property qase.apiToken - API token used to authenticate with Qase TestOps.
 * @property qase.projectCode - Project identifier within Qase TestOps.
 * @property qase.runName - Display name assigned to the Qase test run.
 * @property qase.environment - Target environment label reported to Qase.
 * @property qase.rootSuiteTitle - Root suite title for Qase test suites.
 * @property qase.runComplete - Whether to automatically close runs in Qase upon completion.
 */
export const appConfig = {
  baseURL: process.env.BASE_URL || "https://127.0.0.1:5000",
  e2eRootPath: process.env.E2E_ROOT_PATH || process.cwd(),
  // User login for tested app
  userEmail: process.env.INVENIO_USER_EMAIL || "user@demo.org",
  userPassword: process.env.INVENIO_USER_PASSWORD || "123456",
  authUserFilePath: process.env.AUTH_USER_FILE_PATH || "playwright/.auth/user.json",
  // Admin login for tested app (for tests that require admin privileges)
  adminEmail: process.env.INVENIO_ADMIN_EMAIL || "admin@demo.org",
  adminPassword: process.env.INVENIO_ADMIN_PASSWORD || "123456",
  authAdminFilePath: process.env.AUTH_ADMIN_FILE_PATH || "playwright/.auth/admin.json",
  dataFolderPath: process.env.DATA_FOLDER_PATH || "data",
  // S3_DEFAULT_BLOCK_SIZE=5MB by default; change in invenio.cfg
  s3DefaultBlockSize:  process.env.S3_DEFAULT_BLOCK_SIZE ? parseInt(process.env.S3_DEFAULT_BLOCK_SIZE) : 5 * 1024 * 1024,
  qase: {
    apiToken: process.env.QASE_TESTOPS_API_TOKEN || "",
    projectCode: process.env.QASE_TESTOPS_PROJECT || "",
    runName: process.env.QASE_TESTOPS_RUN_TITLE,
    environment: process.env.QASE_ENVIRONMENT || "development",
    rootSuiteTitle: process.env.QASE_ROOT_SUITE || "Playwright E2E",
    runComplete: process.env.QASE_RUN_COMPLETE === "true", // auto-close run in Qase
  },
};

console.log("[ENV] Loaded from .env:", {
  env: ENV,
  baseURL: appConfig.baseURL,
  e2eRootPath: appConfig.e2eRootPath,
});

export type AppConfig = typeof appConfig;
