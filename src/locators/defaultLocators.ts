/**
 * This module defines locators for various elements in the Invenio E2E tests.
 * It provides a structured way to access elements on the page using CSS selectors.
 */
export const Locators = {

    // ----- LOGIN---

     loginPage: {
        usernameField: 'input#email',
        passwordField: 'input#password',
        submitButton: 'button[type="submit"]',
    },
    footer: {
        languageSelector: '.language-selector, [data-bs-toggle="dropdown"].language',
         languageOption: '.language-selector a, .dropdown-menu a[data-locale]',
        },

 
    },

  // ------------------------ HEADER ------------------------
  header: {
    logoLink: '#invenio-nav a.logo-link, a[href="/"]',
    logInButton: 'a[href^="/login/"]',
  },

  // ------------------------ HOME PAGE ------------------------
  homePage: {
    searchField: 'input[name="q"]',
    searchButton: 'button[type="submit"]',
  },

  // ------------------------ SEARCH PAGE ------------------------
  searchPage: {
    searchResultList: 'section[aria-label="Search results"]',
  },

  // ------------------------ UPLOAD PAGE ------------------------
  uploadPage: {
    titleField: 'input[name="title"]',
    descriptionField: 'textarea[name="description"]',
    resourceTypeDropdown: '[name="resource_type"]',
    resourceTypeOption: (optionText: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${optionText}")]`,
    addCreatorButton: 'button:has-text("Add creator")',
    familyNameField: 'input[name="person_or_org.family_name"]',
    publicationDateField: 'input#metadata\\.publication_date',
    uploadButton: 'input[type="file"]',
    uploadedFile: '[data-testid="uploaded-file"]',
    removeFileButton: '[data-testid="remove-file"]',
    saveDraftButton: 'button:has-text("Save draft")',
    publishButton: 'button:has-text("Publish")',
    editButton: 'button:has-text("Edit")',
    deleteButton: 'button:has-text("Delete record")',
    confirmDeleteButton: 'button:has-text("Delete")',
    discardChangesButton: 'button:has-text("Discard")',
    previewButton: 'button:has-text("Preview")',
    backToEditButton: 'button:has-text("Back to edit")',
    toastMessage: (text: string) => `[role="status"]:has-text("${text}")`,
    recordTitleHeader: "h1.record-title",
    communityInputField: '[aria-labelledby="community-selection-label"] input',
    communityOption: (communityName: string) =>
      `ul[role="listbox"] >> text=${communityName}`,
    embargoRadioButton: '[data-testid="embargo-access-radio-button"]',
    embargoDateInput: '[name="embargo-until"]',
    metadataTab: 'button:has-text("Metadata")',
    filesTab: 'button:has-text("Files")',
    permissionsTab: 'button:has-text("Permissions")',
    additionalDescription: '[name="additional_description"]',
    subjectsInput: '[name="subjects"]',
    languagesDropdown: '[name="languages"]',
    languagesOption: (lang: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${lang}")]`,
    accessDropdown: '[name="access_right"]',
    accessOption: (optionText: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${optionText}")]`,
    successMessage: '[role="status"]:has-text("successfully")',
    discardModalConfirmButton: 'div[role="dialog"] button:has-text("Discard")',
    filesSectionDropzone: '[data-testid="files-dropzone"]',
    selectedCommunityLabel: '[data-testid="community-label"]',
    browseFilesButton: "button.uppy-Dashboard-browse",
    uploadFilesButton: 'button.uppy-StatusBar-actionBtn--upload',

  },
};

export type Locators = typeof Locators;
