import * as dotenv from "dotenv";
import path from "path";

const ENV = process.env.ENV || "dev";
dotenv.config({ path: path.resolve(__dirname, `../.env.${ENV}`) });

/**
 * Central configuration object.
 * Keeps sensitive values out of the codebase and loads them from .env files.
 */
export const appConfig = {
  baseURL: process.env.BASE_URL || "https://127.0.0.1:5000",

/*

  // Qase settings
  qase: {
    token: process.env.QASE_TESTOPS_API_TOKEN || "",
    project: process.env.QASE_TESTOPS_PROJECT || "",
    environment: process.env.QASE_ENVIRONMENT || "development",
    runComplete: process.env.QASE_RUN_COMPLETE === "true", // auto-close run in Qase
  },

  */
 
  // User login for tested app
  userEmail: process.env.INVENIO_USER_EMAIL || "",
  userPassword: process.env.INVENIO_USER_PASSWORD || "",
};

console.log("[ENV] Loaded from .env:", {
  env: ENV,
  baseURL: appConfig.baseURL,
  user: appConfig.userEmail,
});
