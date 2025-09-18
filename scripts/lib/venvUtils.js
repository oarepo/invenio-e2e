const fs = require("fs");
const path = require("path");

// Check if a folder is actually a Python virtual environment
function isValidVirtualEnv(venvPath) {
  const pythonPath = path.join(venvPath, "bin", "python");
  const pyvenvConfig = path.join(venvPath, "pyvenv.cfg");

  return fs.existsSync(pythonPath) && fs.existsSync(pyvenvConfig);
}

// Look for a Python venv in common places (or use VENV_PATH if set)
function findVirtualEnv() {
  // explicit VENV_PATH first
  const venvPath = process.env.VENV_PATH;
  if (venvPath && isValidVirtualEnv(venvPath)) {
    return { path: venvPath, type: "explicit" };
  }

  // common locations
  const commonPaths = [
    path.resolve(__dirname, "../../.venv"),
    path.resolve(__dirname, "../../../invenio-app-rdm/.venv"),
    path.resolve(__dirname, "../../../.venv"),
    path.resolve(__dirname, "../../../../.venv"),
  ];

  for (const venvPath of commonPaths) {
    if (isValidVirtualEnv(venvPath)) {
      return { path: venvPath, type: "auto-detected" };
    }
  }

  return null;
}

// Get site-packages path from venv - works with any Python version.
function getSitePackagesPath(venvPath) {
  const libDir = path.join(venvPath, "lib");
  if (!fs.existsSync(libDir)) {
    return "";
  }

  try {
    const libContents = fs.readdirSync(libDir);
    const pythonDirs = libContents.filter((name) => name.startsWith("python"));

    for (const pythonDir of pythonDirs) {
      const sitePackagesPath = path.join(libDir, pythonDir, "site-packages");
      if (fs.existsSync(sitePackagesPath)) {
        return sitePackagesPath;
      }
    }
  } catch (error) {}

  return "";
}

module.exports = { isValidVirtualEnv, findVirtualEnv, getSitePackagesPath };
