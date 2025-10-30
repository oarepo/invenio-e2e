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
 * @property userEmail - Login email for authentication in the tested application.
 * @property userPassword - Login password for authentication in the tested application.
 * @property authUserFilePath - Path (relative to project root) to the file where the authenticated user state is stored.
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
  // User login for tested app
  userEmail: process.env.INVENIO_USER_EMAIL || "invenio@test.com",
  userPassword: process.env.INVENIO_USER_PASSWORD || "invenio",
  authUserFilePath: process.env.AUTH_USER_FILE_PATH || "playwright/.auth/user.json",
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
  userEmail: appConfig.userEmail,
});

export type AppConfig = typeof appConfig;
