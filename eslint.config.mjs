// @ts-check

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig(
  {
    ignores: ["dist/**", "node_modules/**", "playwright-report/**", "test-results/**", ".git/**"],
  },
  {
    files: ["{src,tests,scripts}/**/*.{js,ts}"],
    plugins: {
      js,
      jsdoc,
    },
    extends: [
      js.configs.recommended,
      jsdoc.configs['flat/contents-typescript-error'],
      jsdoc.configs['flat/logical-typescript-error'],
      jsdoc.configs['flat/stylistic-typescript'],
    ],
    languageOptions: {
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        global: "readonly",
        Buffer: "readonly",
      },
    },
    // Additional rules to override those in the extended configs
    rules: {
      "camelcase": ["error", { properties: "never", ignoreDestructuring: true }], // Invenio rule
    }
  },
  {
    files: ["{src,tests}/**/*.ts"],
    plugins: {
      tseslint,
      jsdoc,
    },
    extends: [
      tseslint.configs.recommendedTypeChecked,
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslintConfigPrettier,
);
