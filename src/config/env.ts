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
 * Central configuration object.
 * Keeps sensitive values out of the codebase and loads them from .env files.
 */
export const appConfig = {
  baseURL: process.env.BASE_URL || "https://127.0.0.1:5000",
  // User login for tested app
  userEmail: process.env.INVENIO_USER_EMAIL || "",
  userPassword: process.env.INVENIO_USER_PASSWORD || "",
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
  user: appConfig.userEmail,
});
