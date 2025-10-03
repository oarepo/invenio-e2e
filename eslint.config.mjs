// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
// import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig(
  {
    files: ["{src,tests}/**/*.{js,ts}"],
    plugins: {
			js,
		},
		extends: ["js/recommended"],
    rules: {
      "camelcase": ["error", { properties: "never", ignoreDestructuring: true }],
    }
  },
  {
    files: ["scripts/**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],
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
    rules: {
      "camelcase": ["error", { properties: "never", ignoreDestructuring: true }],
    }
  },
  {
    files: ["{src,tests}/**/*.ts"],
    plugins: {
      tseslint,
      // jsdoc,
    },
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // jsdoc.configs['flat/contents-typescript-error'],
      // jsdoc.configs['flat/logical-typescript-error'],
      // jsdoc.configs['flat/stylistic-typescript'],
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
