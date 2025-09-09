const fs = require("fs");
const path = require("path");

/**
 * Check if a directory is a valid Python virtual env.
 */
function isValidVirtualEnv(venvPath) {
  const pythonPath = path.join(venvPath, "bin", "python");
  const pyvenvConfig = path.join(venvPath, "pyvenv.cfg");

  return fs.existsSync(pythonPath) && fs.existsSync(pyvenvConfig);
}

/**
 * Find a Python virtual environment in various standard locations.
 */
function findVirtualEnv() {
  // explicit VENV_PATH first
  if (process.env.VENV_PATH) {
    const venvPath = process.env.VENV_PATH;
    if (isValidVirtualEnv(venvPath)) {
      return { path: venvPath, type: "explicit" };
    }
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

/**
 * Get the site-packages path from a virtual env.
 */
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

module.exports = {
  isValidVirtualEnv,
  findVirtualEnv,
  getSitePackagesPath,
};
