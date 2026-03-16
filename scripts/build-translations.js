#!/usr/bin/env node

/**
 * Build translations from Invenio packages.
 *
 * Thin wrapper around scripts/i18n_collect.py (requires invenio-i18n >= 3.5.0).
 * Requires an activated Python virtual environment with invenio-i18n installed.
 *
 * Usage:
 *   npm run build-translations -- -l de -l en
 *   npm run build-translations -- -l de -p invenio-app-rdm -p invenio-rdm-records
 *
 * At least one -l <locale> argument is required (e.g. -l de -l en).
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
      `Translation collection failed (python: ${PYTHON}). See output above for details.`
    );
    process.exit(1);
  }
}

function buildCommand(args) {
  const helperScript = path.join(__dirname, "i18n_collect.py");
  const parts = [PYTHON, `"${helperScript}"`, "--output-dir", `"${OUTPUT_DIR}"`];

  const hasPackages =
    args.includes("-p") ||
    args.includes("--packages") ||
    args.includes("--all-packages");
  if (!hasPackages) {
    parts.push("--all-packages");
  }

  parts.push("--write-package-wise-too");

  // Pass through user args (-l de, -p pkg, etc.)
  parts.push(...args);

  return parts.join(" ");
}

main();
