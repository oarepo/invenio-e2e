import * as dotenv from 'dotenv';
import path from 'path';

/**
 * Responsible for loading environment variables from the correct `.env` file based on the current environment (e.g., dev, test, prod).
 * Uses the `dotenv` package to read variables from files like `.env.dev`.
 * 
 * Exports a central configuration object `appConfig` with commonly used settings such as baseURL and QASE integration tokens.
 * 
 * This approach centralizes environment-specific configuration and keeps sensitive values outside of the codebase.
 */

// Load the appropriate .env file based on ENV variable
const ENV = process.env.ENV || 'dev';
const configPath = path.resolve(__dirname, `../.env.${ENV}`);
dotenv.config({ path: configPath });

export const config = {
    // Load user credentials from environment variables
    userEmail: process.env.INVENIO_USER_EMAIL || 'invenio@test.com',
    userPassword: process.env.INVENIO_USER_PASSWORD || 'invenio',
};

export type Config = typeof config;
