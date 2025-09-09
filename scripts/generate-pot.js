#!/usr/bin/env node

/**
 * POT File Generation
 *
 * Algorithm: detect venv → run `invenio i18n create-global-pot` → if missing, run `pybabel extract` → write messages.pot
 *
 * Usage:
 * - `npm run generate-pot` - Generate POT using invenio i18n create-global-pot
 * - `VENV_PATH=/path/to/venv npm run generate-pot` - Use custom virtual environment
 * - `npm run generate-pot --output path/to/output.pot` - Custom output location
 */

const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const OUTPUT_DIR = process.env.I18N_OUTPUT_DIR || path.join("src", "translations");

/**
 * MAIN ALGORITHM: POT Generation
 *
 * 1: Find virtual environment
 * 2: Try invenio i18n create-global-pot command
 * 3: Fallback to direct pybabel extraction
 * 4: Write POT file to translations/
 */
async function main() {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf("--output");
  const customOutput = outputIndex !== -1 ? args[outputIndex + 1] : null;

  console.log("POT Generation: invenio i18n create-global-pot");
  console.log("===================================================");

  const venvInfo = findVirtualEnv();
  if (!venvInfo) {
    console.error("Virtual environment not found!");
    console.error(
      "Please set VENV_PATH or create a .venv in an Invenio package directory."
    );
    process.exit(1);
  }
  console.log(`Using virtual environment: ${venvInfo.path}`);

  const outputFile = customOutput || path.join(OUTPUT_DIR, "messages.pot");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const invenioResult = tryInvenioI18nCommand(venvInfo, outputFile);
  if (invenioResult.success) {
    console.log(`POT file generated: ${outputFile}`);
    console.log("Used core invenio-i18n create-global-pot command");
    return;
  }

  console.log("Falling back to direct pybabel extraction...");

  const sitePackagesPath = getSitePackagesPath(venvInfo.path);
  if (!sitePackagesPath) {
    console.error(`Site-packages directory not found in: ${venvInfo.path}`);
    process.exit(1);
  }

  console.log(`Site-packages path: ${sitePackagesPath}`);
  await extractStringsWithPybabel(sitePackagesPath, outputFile, venvInfo);

  console.log(`POT file generated: ${outputFile}`);
}

main().catch(console.error);

// =============================================================================
// IMPLEMENTATION FUNCTIONS (utility functions used by main algorithm above)
// =============================================================================

function isValidVirtualEnv(venvPath) {
  if (!fs.existsSync(venvPath)) return false;

  const pythonPath = path.join(venvPath, "bin", "python");
  const pyvenvConfig = path.join(venvPath, "pyvenv.cfg");

  return fs.existsSync(pythonPath) && fs.existsSync(pyvenvConfig);
}

function findVirtualEnv() {
  const explicitPaths = [process.env.VENV_PATH, process.env.VIRTUAL_ENV].filter(
    Boolean
  );

  for (const venvPath of explicitPaths) {
    if (isValidVirtualEnv(venvPath)) {
      return { path: venvPath, type: "explicit" };
    }
  }

  const commonPaths = [
    path.resolve(__dirname, "../.venv"),
    path.resolve(__dirname, "../../invenio-app-rdm/.venv"),
    path.resolve(__dirname, "../../.venv"),
    path.resolve(__dirname, "../../../.venv"),
  ];

  for (const venvPath of commonPaths) {
    if (isValidVirtualEnv(venvPath)) {
      return { path: venvPath, type: "auto-detected" };
    }
  }

  return null;
}

function getSitePackagesPath(venvPath) {
  const libDir = path.join(venvPath, "lib");
  if (!fs.existsSync(libDir)) {
    return null;
  }

  const sitePackagesPath = path.join(libDir, "python3.13", "site-packages");
  if (fs.existsSync(sitePackagesPath)) {
    return sitePackagesPath;
  }

  return null;
}

function tryInvenioI18nCommand(venvInfo, outputFile) {
  console.log("Trying invenio i18n create-global-pot...");

  try {
    const pythonPath = path.join(venvInfo.path, "bin", "python");
    const command = `${pythonPath} -m invenio i18n create-global-pot`;
    const args = outputFile ? ` --output "${outputFile}"` : "";
    const fullCommand = `${command}${args}`;

    console.log(`Running: ${fullCommand}`);

    const possibleDirs = [
      path.resolve(__dirname, "../../invenio-app-rdm"),
      path.resolve(__dirname, "../../invenio-rdm-records"),
      path.dirname(venvInfo.path),
    ];

    let workingDir = null;
    for (const dir of possibleDirs) {
      if (
        fs.existsSync(path.join(dir, "setup.cfg")) ||
        fs.existsSync(path.join(dir, "pyproject.toml"))
      ) {
        workingDir = dir;
        break;
      }
    }

    if (!workingDir) {
      throw new Error("No valid Invenio package directory found");
    }

    const result = execSync(fullCommand, {
      cwd: workingDir,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${path.dirname(pythonPath)}:${process.env.PATH}`,
        VIRTUAL_ENV: venvInfo.path,
      },
    });

    console.log("invenio i18n create-global-pot succeeded!");
    return { success: true, output: result };
  } catch (error) {
    console.log(
      "invenio i18n create-global-pot not available, falling back to pybabel..."
    );
    return { success: false, error: error.message };
  }
}

function extractStringsWithPybabel(sitePackagesPath, outputFile, venvInfo) {
  return new Promise((resolve, reject) => {
    const packageDirs = fs
      .readdirSync(sitePackagesPath)
      .filter((name) => name.startsWith("invenio_"))
      .map((name) => path.join(sitePackagesPath, name))
      .filter((fullPath) => fs.statSync(fullPath).isDirectory());

    if (packageDirs.length === 0) {
      return reject(new Error("No Invenio packages found to extract from."));
    }

    console.log(`Extracting strings from ${packageDirs.length} packages`);

    const args = [
      "extract",
      "-o",
      outputFile,
      "--keyword=_",
      "--keyword=gettext",
      "--keyword=ngettext:1,2",
      "--keyword=lazy_gettext",
      "--keyword=lazy_ngettext:1,2",
      "--keyword=_l",
      "--keyword=_ln:1,2",
      "--keyword=_:1",
      "--keyword=gettext:1",
      "--keyword=ngettext:1,2",
      "--keyword=lazy_pgettext:1c,2",
      "--keyword=pgettext:1c,2",
      "--keyword=npgettext:1c,2,3",
      "--add-comments=TRANSLATORS:",
      "--add-comments=NOTE:",
      "--sort-by-file",
      "--no-wrap",
      ...packageDirs,
    ];

    const pythonPath = path.join(venvInfo.path, "bin", "python");
    const command = pythonPath;
    const commandArgs = ["-m", "babel.messages.frontend", ...args];

    const pybabel = spawn(command, commandArgs, {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        PATH: `${path.dirname(pythonPath)}:${process.env.PATH}`,
        VIRTUAL_ENV: venvInfo.path,
      },
    });

    let stderr = "";

    pybabel.stderr.on("data", (data) => (stderr += data.toString()));

    pybabel.on("close", (code) => {
      if (code === 0) {
        console.log("POT file generated successfully");
        resolve();
      } else {
        reject(new Error(`pybabel failed: ${stderr}`));
      }
    });

    pybabel.on("error", () => {
      reject(
        new Error("pybabel not found. Please install Babel: uv add babel")
      );
    });
  });
}
