/**
 * This module defines locators for various elements in the Invenio E2E tests.
 * It provides a structured way to access elements on the page using selectors.
 */
export const locators = {
  // ------------------------ HEADER ------------------------
  header: {
    logoLink: '#invenio-nav a.logo-link, a[href="/"]',
    logInButton: 'a[href^="/login/"]',
    communitiesLink: 'a[href="/communities"]',
  },

  // ------------------------ HOME PAGE ------------------------
  homePage: {
    searchField: 'input[name="q"]',
    searchButton: 'button[type="submit"]',
    quickCreateButton: "#quick-create-dropdown-btn",
    newCommunityMenuItem: 'a[role="menuitem"][href="/communities-new"]:visible',
    newUploadMenuItem: 'a[role="menuitem"][href="/uploads/new"]:visible',
  },

  // ------------------------ SEARCH PAGE ------------------------
  searchPage: {
    searchResultList: 'section[aria-label="Search results"]',
  },

  // ------------------------ UPLOAD PAGE ------------------------
  uploadPage: {
    titleField: "#metadata\\.title",
    descriptionField: 'textarea[name="description"]',
    metadataOnlyCheckbox: 'div.ui.checkbox:has-text("Metadata-only record")',
    resourceTypeDropdown: '[name="metadata.resource_type"]',
    resourceTypeOption: (optionText: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${optionText}")]`,
    addCreatorButton: 'button:has-text("Add creator")',
    familyNameField: 'input[name="person_or_org.family_name"]',
    givenNameField: 'input[name="person_or_org.given_name"]',
    saveAddCreatorButton: 'button[name="submit"].ui.primary.button',
    publicationDateField: "input#metadata\\.publication_date",
    uploadButton: 'input[type="file"]',
    uploadedFile: (filename: string) =>
      `.uppy-Dashboard-Item-name:has-text("${filename}")`,
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
    recordTitleHeader: "#record-title",
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
    uploadFilesButton: "button.uppy-StatusBar-actionBtn--upload",
    warningMessage: "#warning-feedback-div[i.exclamation",
    fieldWithError: "div.field.error",
    errorMessageInsideField: "div.ui.pointing.prompt.label",
    uploadCompleteBar: (fileName: string) =>
      `.file-upload-progress[data-percent="100"]`,
  },

  // ------------------------ PREVIEW PAGE -----------------------
  previewPage: {
    saveDraftInfoMessage: "div.ui.info.flashed.bottom.attached.manage.message",
    saveDraftVersionsInfoMessage: "div.ui.info.message.no-border-radius.m-0",
    recordDescription: "#description > div",
    uploadedFilesRows: "table.ui.striped.table.files.fluid.open tbody tr",
    resourceType: 'dl.details-list dt:has-text("Resource type") + dd',
    creator: '#creatibutors ul.creatibutors li .creatibutor-name',
    metadataOnlyLabel: 'span[aria-label="No files are available for this record."]:has-text("Metadata-only")',
  },

  // ------------------------ NEW COMMUNITY PAGE ------------------------
  newCommunityPage: {
    pageTitle: 'h1:has-text("Setup your new community")',
    communityNameField: "#metadata\\.title",
    communityIdentifierField: "#slug",
    newCommunityButton: 'button:has-text("New community")',
    publicRadio: '(//input[@type="radio" and @value="public"])[1]',
    restrictedRadio: '(//input[@type="radio" and @value="restricted"])[1]',
    createCommunityButton: "button.ui.icon.positive.left.labeled.button",
    communityNameHeader: "h1.ui.medium.header.mb-0",
  },

  // ------------------------ COMMUNITIES PAGE ------------------------
  communitiesPage: {
    pageTitle: 'h1:has-text("Communities")',
    firstCommunityCard: "div.centered.image.fallback_image",
    recordsTab: 'a.item.active:has-text("Records")',
    searchField: 'input[name="q"]',
    searchButton: 'button[type="submit"]',
    communityNameLink: "a.ui.medium.header.mb-0",
  },

  // ------------------------ COMMUNITY SEARCH PAGE ------------------------
  communitySearchPage: {
    sortDropdown:
      '(//div[@aria-label="Sort" and contains(@class, "ui selection dropdown")])[2]',
    sortOption: (option: string) =>
      `//div[contains(@class,"visible menu")]/div[@role="option"]/span[text()="${option}"]`,
    sortOptionSelected:
      '//div[@aria-label="Sort"]//div[contains(@class,"divider text")]',
  },

  // ------------------------ COMMUNITY DETAIL PAGE ------------------------
  communityDetailPage: {
    // Navigation
    recordsTab: 'a.item.active:has-text("Records")',
    membersTab: 'a.item:has-text("Members")',
    settingsTab: 'a.item:has-text("Settings")',
    curationPolicyTab: 'a.item:has-text("Curation policy")',
    aboutTab: 'a.item:has-text("About")',
    privilegesTab: "#privileges",
    reviewPolicyTab: 'a#curation_policy.item[role="tab"]',
    pagesTab: "#pages",
    closedRequestsButton: 'button.request-search-filter:has-text("Closed")',

    // Fields
    communityNameInput: "#metadata\\.title",
    deleteMembersCheckbox: 'label[for="members-confirm"]',
    deleteRecordsCheckbox: 'label[for="records-confirm"]',
    deleteSlugCheckbox: 'label[for="slug-confirm"]',
    deleteIdentifierLabel: 'label[for="confirm-delete"] strong',
    deleteIdentifierInput: "#confirm-delete",
    memberField:
      'div.field:has-text("Member") div.ui.fluid.multiple.search.selection.dropdown',
    roleCheckbox: (index: number) =>
      `(//div[@id="members-users-tab-panel"]//div[contains(@class, "checkbox")])[${index}]`,
    curationPolicyIframe: '(//div[@class="tox-edit-area"])[1]',
    aboutPageIframe: '(//div[@class="tox-edit-area"])[2]',
    headerCommunityName: "h1.ui.medium.header.mb-0",
    roleDropdown: '//div[@aria-label="Role owner"]',
    visibilityDropdown:
      '//div[@aria-label="Visibility Hidden" or @aria-label="Visibility Public"]',

    // Buttons
    saveButton: "button.ui.icon.primary.left.labeled.button",
    deleteCommunityButton: "#delete-community-button",
    permanentlyDeleteButton:
      'button.ui.negative.button:has-text("Permanently delete")',
    acceptAndPublishButton: 'button:has-text("Accept and publish")',
    inviteButton: "button.ui.tiny.compact.fluid.icon.positive.left.labeled",
    inviteConfirmButton:
      'button.ui.icon.primary.left.labeled.button:has-text("Invite")',
    leaveButton:
      "button.ui.tiny.compact.fluid.icon.negative.left.labeled.button",
    removeButton:
      'button.ui.tiny.compact.fluid.icon.left.labeled.button:has-text("Remove...")',
    saveButtonPrivileges: "button.ui.icon.primary.toggle.left.labeled.button",
    saveButtonPages: '//button[@type="submit"]',
    viewAllVersionsSlider: 'label:text("View all versions")',

    // Verification
    restrictedLabel: "div.ui.small.horizontal.label.access-status.restricted",
    noRestrictedRecords:
      'h2.ui.header:has-text("We couldn\'t find any matches for your search")',
    communityMember: (email: string) =>
      `tr.community-member-item >> text=${email}`,
    youLabel: 'div.ui.tiny.label.primary:has-text("You")',
    curationPolicyText:
      ".ui.text.container.rich-input-content.rel-m-2.rel-pt-1",
    aboutText: ".ui.text.container.rel-m-2.rel-pt-1",
    leaveCommunityMessage:
      '//div[@class="ui placeholder center aligned segment"]',
    recordManagementMenu: '//div[@id="recordManagement"]',
    accessStatusCheckbox: (status: string) =>
      `(//input[@aria-label="${status}"]/ancestor::div[contains(@class,"checkbox")])[2]`,
    numberLabel: '//div[@class="ui label"]',
  },

  // ------------------------ MY DASHBOARD PAGE ------------------------
  myDashboardPage: {
    // Navigation
    communitiesLink: 'a.item[href="/me/communities"]',
    requestsLink: 'a:has-text("Requests")',
    firstRecordDetail: "a.truncate-lines-2",
    firstCommunityCard: "div.centered.image.fallback_image",
    recordsTab: 'a.item.active:has-text("Records")',

    // Buttons
    editFirstRecordButton:
      '(//button[contains(@class, "ui small compact icon right floated left labeled button") and .//text()="Edit"])[1]',
    acceptButton: (index: number) =>
      `button:has-text("Accept") >> nth=${index}`,
    declineButton: (index: number) =>
      `button:has-text("Decline") >> nth=${index}`,
    acceptConfirmButton:
      '#accept .actions > button.ui.icon.positive.left.labeled.button:has-text("Accept")',
    declineConfirmButton:
      '.actions > button.ui.icon.negative.left.labeled.button:has-text("Decline")',
    versionsToggle: '(//div[@class="ui toggle checkbox"]/label)[2]',

    // Verification
    recordTitle: (title: string) => `text=${title}`,
    allDoneMessage:
      'div.ui.placeholder.center.aligned.segment h1.ui.icon.header:has-text("All done!")',
    newVersionDraftLabel: 'text="New version draft"',
  },

  // ---------------------------- LOGIN ----------------------------
  loginPage: {
    usernameField: "input#email",
    passwordField: "input#password",
    submitButton: 'button[type="submit"]',
  },
  footer: {
    languageSelector:
      '.language-selector, [data-bs-toggle="dropdown"].language',
    languageOption: ".language-selector a, .dropdown-menu a[data-locale]",
  },
};
