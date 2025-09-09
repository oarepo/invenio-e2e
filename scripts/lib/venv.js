const fs = require("fs");
const path = require("path");

function isValidVirtualEnv(venvPath) {
    if (!fs.existsSync(venvPath)) return false;

    const pythonPath = path.join(venvPath, "bin", "python");
    const pyvenvConfig = path.join(venvPath, "pyvenv.cfg");

    return fs.existsSync(pythonPath) && fs.existsSync(pyvenvConfig);
}

function findVirtualEnv() {
    const explicitPaths = [
        process.env.VENV_PATH,
        process.env.VIRTUAL_ENV
    ].filter(Boolean);

    for (const venvPath of explicitPaths) {
        if (isValidVirtualEnv(venvPath)) {
            return { path: venvPath, type: 'explicit' };
        }
    }

    const commonPaths = [
        // invenio-e2e/.venv (scripts/lib -> scripts -> project root)
        path.resolve(__dirname, "../../.venv"),
        // invenio-app-rdm/.venv (scripts/lib -> scripts -> project root's sibling)
        path.resolve(__dirname, "../../../invenio-app-rdm/.venv"),
        // parent/.venv
        path.resolve(__dirname, "../../../.venv"),
        // grandparent/.venv
        path.resolve(__dirname, "../../../../.venv")
    ];

    for (const venvPath of commonPaths) {
        if (isValidVirtualEnv(venvPath)) {
            return { path: venvPath, type: 'auto-detected' };
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

module.exports = {
    isValidVirtualEnv,
    findVirtualEnv,
    getSitePackagesPath,
};


