const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

/**
 * Run the invenio i18n create-global-pot command.
 */
function tryInvenioI18nCommand(venvInfo, outputFile) {
  console.log("Trying invenio i18n create-global-pot...");

  try {
    const pythonPath = path.join(venvInfo.path, "bin", "python");

    const args = outputFile ? ` --output "${outputFile}"` : "";

    // valid Invenio package directory to run the command from
    const packageDirs = [
      path.resolve(__dirname, "../../../invenio-app-rdm"),
      path.resolve(__dirname, "../../../invenio-rdm-records"),
    ];

    let workingDir = null;
    for (const dir of packageDirs) {
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

    const command = `${pythonPath} -m invenio i18n create-global-pot${args}`;
    console.log(`Running: ${command}`);
    execSync(command, {
      cwd: workingDir,
      encoding: "utf8",
      stdio: "pipe",
    });

    console.log("invenio i18n create-global-pot succeeded!");
    return { success: true };
  } catch (error) {
    console.log(
      "invenio i18n create-global-pot not available, falling back to pybabel..."
    );
    return { success: false, error: error.message };
  }
}

/**
 * Extract strings using pybabel as a fallback method.
 */
async function extractStringsWithPybabel(
  sitePackagesPath,
  outputFile,
  venvInfo
) {
  return new Promise((resolve, reject) => {
    const packages = fs
      .readdirSync(sitePackagesPath)
      .filter((name) => name.startsWith("invenio_"))
      .map((name) => path.join(sitePackagesPath, name));

    if (packages.length === 0) {
      return reject(new Error("No Invenio packages found to extract from."));
    }

    console.log(`Extracting strings from ${packages.length} packages`);

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
        console.log("POT file generated successfully");
        resolve();
      } else {
        reject(new Error(`pybabel failed with code ${code}: ${stderr}`));
      }
    });

    pybabel.on("error", () => {
      reject(
        new Error("pybabel not found. Please install Babel: uv add babel")
      );
    });
  });
}

module.exports = {
  tryInvenioI18nCommand,
  extractStringsWithPybabel,
};
