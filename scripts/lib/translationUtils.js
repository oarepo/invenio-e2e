const fs = require("fs");
const path = require("path");

// Look for an Invenio package in a few different folders
function resolvePackagePath(packageName) {
  const locations = [
    process.env.INVENIO_PACKAGES_DIR && path.join(process.env.INVENIO_PACKAGES_DIR, packageName),
    path.resolve(__dirname, "../../..", packageName),
    path.resolve(__dirname, "../..", packageName),
  ].filter(Boolean);

  return locations.find(fs.existsSync) || null;
}

// Read a .po file and turn it into JSON translations we can use
async function parsePoFile(poFilePath, packageName) {
  try {
    const { gettextToI18next } = await import("i18next-conv");
    const poContent = fs.readFileSync(poFilePath, "utf8");

    const result = await gettextToI18next("", poContent, {
      skipUntranslated: true,
      compatibilityJSON: "v4",
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
  } catch {
    return {};
  }
}

// Go through a .po file and find missing translations, fuzzy ones, etc.
function createValidationReportOfPoFile(poFilePath, packageName, locale) {
  try {
    const poContent = fs.readFileSync(poFilePath, "utf8");
    const lines = poContent.split("\n");

    const issues = {
      untranslated: [],
      fuzzyTranslations: [],
      obsoleteTranslations: [],
    };

    let currentMsgid = "";
    let currentMsgstr = "";
    let isFuzzy = false;
    let isObsolete = false;
    let inMsgid = false;
    let inMsgstr = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // checks for flags
      if (trimmed.startsWith("#,") && trimmed.includes("fuzzy")) {
        isFuzzy = true;
      }
      if (trimmed.startsWith("#~")) {
        isObsolete = true;
      }

      // parse msgid and msgstr
      if (trimmed.startsWith("msgid ")) {
        currentMsgid = trimmed.substring(6).replace(/^"(.*)"$/, "$1");
        inMsgid = true;
        inMsgstr = false;
      } else if (inMsgid && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        currentMsgid += trimmed.replace(/^"(.*)"$/, "$1");
      } else if (trimmed.startsWith("msgstr ")) {
        currentMsgstr = trimmed.substring(7).replace(/^"(.*)"$/, "$1");
        inMsgid = false;
        inMsgstr = true;
      } else if (inMsgstr && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        currentMsgstr += trimmed.replace(/^"(.*)"$/, "$1");
      } else if (trimmed === "" || trimmed.startsWith("msgid ")) {
        // end of entry - process it
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
        obsoleteTranslations: issues.obsoleteTranslations.length,
      },
    };
  } catch {
    return null;
  }
}

// Scan package for translation files
async function scanPackage(packagePath, packageName, includeValidation = false) {
  const translations = {};
  const validationReport = [];

  let translationsDir = path.join(packagePath, packageName, "translations");
  if (!fs.existsSync(translationsDir)) {
    translationsDir = path.join(packagePath, "translations");
  }

  if (!fs.existsSync(translationsDir)) {
    return { translations, validationReport };
  }

  const locales = fs.readdirSync(translationsDir);
  for (const locale of locales) {
    const localePath = path.join(translationsDir, locale);
    if (fs.statSync(localePath).isDirectory()) {
      const poFile = path.join(localePath, "LC_MESSAGES/messages.po");
      if (fs.existsSync(poFile)) {
        translations[locale] = await parsePoFile(poFile, packageName);

        if (includeValidation) {
          const validation = createValidationReportOfPoFile(poFile, packageName, locale);
          if (validation) {
            validationReport.push(validation);
          }
        }
      }
    }
  }

  return { translations, validationReport };
}

module.exports = { resolvePackagePath, parsePoFile, createValidationReportOfPoFile, scanPackage };
