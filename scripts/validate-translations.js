#!/usr/bin/env node

/**
 * Validate translations from Invenio packages.
 *
 * Thin wrapper around scripts/i18n_validate.py (requires invenio-i18n >= 3.5.0).
 * Requires an activated Python virtual environment with invenio-i18n installed.
 *
 * Usage:
 *   npm run validate-translations
 *   npm run validate-translations -- -l de -l en
 *   npm run validate-translations -- -p invenio-app-rdm
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = process.env.I18N_OUTPUT_DIR || path.resolve("translations");
const PYTHON = process.env.PYTHON || "python";

function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const cmd = buildCommand(args);

  console.log(`Running: ${cmd}`);

  try {
    execSync(cmd, { stdio: "inherit", encoding: "utf8" });
  } catch {
    console.error(
      `Translation validation failed (python: ${PYTHON}). See output above for details.`
    );
    process.exit(1);
  }
}

function buildCommand(args) {
  const helperScript = path.join(__dirname, "i18n_validate.py");
  const parts = [PYTHON, `"${helperScript}"`, "--output-dir", `"${OUTPUT_DIR}"`];

  const hasPackages =
    args.includes("-p") ||
    args.includes("--packages") ||
    args.includes("--all-packages");
  if (!hasPackages) {
    parts.push("--all-packages");
  }

  // Pass through user args (-l de, -p pkg, etc.)
  parts.push(...args);

  return parts.join(" ");
}

main();
