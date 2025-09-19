const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

// Find an Invenio package folder where we can run commands
function findValidInvenioPackageDir() {
  const packageNames = ["invenio-app-rdm", "invenio-rdm-records"];
  let packageDirs;

  if (process.env.INVENIO_PACKAGES_DIR) {
    packageDirs = packageNames.map((name) => path.join(process.env.INVENIO_PACKAGES_DIR, name));
  } else {
    packageDirs = packageNames.map((name) => path.resolve(__dirname, "../../../" + name));
  }

  for (const dir of packageDirs) {
    if (
      fs.existsSync(path.join(dir, "setup.cfg")) ||
      fs.existsSync(path.join(dir, "pyproject.toml"))
    ) {
      return dir;
    }
  }

  return null;
}

// Try to run the invenio i18n command (returns success/failure)
function tryInvenioI18nCommand(venvInfo, outputFile) {
  try {
    const pythonPath = path.join(venvInfo.path, "bin", "python");
    const args = outputFile ? ` --output "${outputFile}"` : "";
    const workingDir = findValidInvenioPackageDir();
    if (!workingDir) {
      throw new Error("No valid Invenio package directory found");
    }

    const command = `${pythonPath} -m invenio i18n create-global-pot${args}`;
    execSync(command, {
      cwd: workingDir,
      encoding: "utf8",
      stdio: "pipe",
    });

    return { success: true, command };
  } catch (error) {
    return { success: false };
  }
}

// Extract strings with pybabel from cloned package directories
async function extractStringsWithPybabel(outputFile, venvInfo) {
  return new Promise((resolve, reject) => {
    const packageNames = ["invenio-app-rdm", "invenio-rdm-records"];
    let packageDirs;

    if (process.env.INVENIO_PACKAGES_DIR) {
      packageDirs = packageNames.map((name) => path.join(process.env.INVENIO_PACKAGES_DIR, name));
    } else {
      packageDirs = packageNames.map((name) => path.resolve(__dirname, "../../../" + name));
    }

    const packages = packageDirs.filter(fs.existsSync);

    if (packages.length === 0) {
      console.log("No Invenio packages found - skipping extraction as expected in CI");
      return resolve();
    }

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
      ...packages,
    ];

    const pythonPath = path.join(venvInfo.path, "bin", "python");
    const commandArgs = ["-m", "babel.messages.frontend", ...args];
    const pybabel = spawn(pythonPath, commandArgs, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    pybabel.stderr.on("data", (data) => (stderr += data.toString()));

    pybabel.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pybabel failed with code ${code}: ${stderr}`));
      }
    });

    pybabel.on("error", () => {
      reject(new Error("pybabel not found. Please install Babel: uv add babel"));
    });
  });
}

module.exports = { tryInvenioI18nCommand, extractStringsWithPybabel };
