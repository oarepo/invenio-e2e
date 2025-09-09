const fs = require("fs");
const path = require("path");

function resolvePackagePath(packageName) {
    const locations = [
        process.env.INVENIO_PACKAGES_DIR && path.join(process.env.INVENIO_PACKAGES_DIR, packageName),
        path.resolve(__dirname, "../..", packageName),
        path.resolve(__dirname, "..", packageName)
    ].filter(Boolean);

    return locations.find(fs.existsSync) || null;
}

async function parsePoFile(poFilePath, packageName) {
    try {
        const { gettextToI18next } = await import("i18next-conv");
        const poContent = fs.readFileSync(poFilePath, "utf8");

        const result = await gettextToI18next("", poContent, {
            skipUntranslated: true,
            compatibilityJSON: "v4"
        });

        const translations = JSON.parse(result);
        const output = {};

        for (const [key, value] of Object.entries(translations)) {
            if (key && value && typeof value === "string") {
                const translationValue = value.trim() || key;
                output[key] = translationValue;
                output[`${packageName}:${key}`] = translationValue;
            }
        }

        return output;
    } catch (error) {
        console.warn(`Failed to parse ${poFilePath}:`, error.message);
        return {};
    }
}

function createValidationReportOfPoFile(poFilePath, packageName, locale) {
    try {
        const poContent = fs.readFileSync(poFilePath, "utf8");
        const lines = poContent.split("\n");

        const issues = {
            untranslated: [],
            fuzzyTranslations: [],
            obsoleteTranslations: []
        };

        let currentMsgid = "";
        let currentMsgstr = "";
        let isFuzzy = false;
        let isObsolete = false;
        let inMsgid = false;
        let inMsgstr = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("#,") && trimmed.includes("fuzzy")) {
                isFuzzy = true;
            }
            if (trimmed.startsWith("#~")) {
                isObsolete = true;
            }

            if (trimmed.startsWith("msgid ")) {
                currentMsgid = trimmed.substring(6).replace(/^"(.*)"$/, "$1");
                inMsgid = true;
                inMsgstr = false;
            } else if (inMsgid && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
                currentMsgid += trimmed.replace(/^"(.*)"$/, "$1");
            } else if (trimmed.startsWith("msgstr ")) {
                currentMsgstr = trimmed.substring(7).replace(/^"(.*)"$/, "$1");
                inMsgid = false;
                inMsgstr = true;
            } else if (inMsgstr && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
                currentMsgstr += trimmed.replace(/^"(.*)"$/, "$1");
            } else if (trimmed === "" || trimmed.startsWith("msgid ")) {
                if (currentMsgid && currentMsgid !== "") {
                    if (isObsolete) {
                        issues.obsoleteTranslations.push(currentMsgid);
                    } else if (isFuzzy) {
                        issues.fuzzyTranslations.push(currentMsgid);
                    } else if (!currentMsgstr || currentMsgstr === "") {
                        issues.untranslated.push(currentMsgid);
                    }
                }

                currentMsgid = "";
                currentMsgstr = "";
                isFuzzy = false;
                isObsolete = false;
                inMsgid = false;
                inMsgstr = false;

                if (trimmed.startsWith("msgid ")) {
                    currentMsgid = trimmed.substring(6).replace(/^"(.*)"$/, "$1");
                    inMsgid = true;
                }
            }
        }

        return {
            package: packageName,
            locale: locale,
            file: poFilePath,
            issues: issues,
            counts: {
                untranslated: issues.untranslated.length,
                fuzzyTranslations: issues.fuzzyTranslations.length,
                obsoleteTranslations: issues.obsoleteTranslations.length
            }
        };
    } catch (error) {
        console.warn(`Failed to validate ${poFilePath}:`, error.message);
        return null;
    }
}

module.exports = {
    resolvePackagePath,
    parsePoFile,
    createValidationReportOfPoFile,
};


