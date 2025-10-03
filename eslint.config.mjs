// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig(
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended-mixed'],
  {
    files: ["{src,tests}/**/*.ts"],
    plugins: {
      tseslint,
    },
    extends: [
      tseslint.configs.recommendedTypeChecked
    ],
  },
  eslintConfigPrettier,
  {
    files: ["{src,tests,scripts}/**/*.{js,ts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "camelcase": ["error", { properties: "never", ignoreDestructuring: true }],
    }
  },
);
