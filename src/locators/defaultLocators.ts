/**
 * This module defines locators for various elements in the Invenio E2E tests.
 *
 * The `locators` object provides a structured and centralized way to reference
 * selectors used in Playwright tests. It is divided by pages and main UI sections.
 * @module locators
 */
export const locators = {
  // ------------------------ HEADER ------------------------

  /**
   * Locators for the main site header section.
   * Includes navigation links, logo, and login-related elements.
   * @property {string} logoLink - Selector for the main logo that redirects to the home page.
   * @property {string} logInButton - Selector for the "Log in" button in the header.
   * @property {string} communitiesLink - Selector for the navigation link to the "Communities" page.
   */

  header: {
    /** Selector for the main logo link that navigates to the home page. */
    logoLink: '#invenio-nav a.logo-link, a[href="/"]',

    /** Selector for the button that navigates to the login page. */
    logInButton: 'a[href^="/login/"]',

    /** Selector for the navigation link that opens the Communities page. */
    communitiesLink: 'a[href="/communities"]',
  },

  // ------------------------ HOME PAGE ------------------------

  /**
   * Locators for the Home Page.
   * Contains selectors for the main search field and quick actions (e.g., creating uploads or communities).
   * @property {string} searchField - Selector for the search input field used to enter queries for records, communities, or users.
   * @property {string} searchButton - Selector for the button that triggers a search.
   * @property {string} quickCreateButton - Selector for the "Quick Create" dropdown button that provides shortcuts to create new items.
   * @property {string} newCommunityMenuItem - Selector for the "New Community" option inside the Quick Create dropdown.
   * @property {string} newUploadMenuItem - Selector for the "New Upload" option inside the Quick Create dropdown.
   */

  homePage: {
    /** Selector for the search input field used to enter queries. */
    searchField: 'input[name="q"]',

    /** Selector for the button that executes a search. */
    searchButton: 'button[type="submit"]',

    /** Selector for the dropdown button providing quick creation options. */
    quickCreateButton: "#quick-create-dropdown-btn",

    /** Selector for the "New Community" menu item in the Quick Create dropdown. */
    newCommunityMenuItem: 'a[role="menuitem"][href="/communities-new"]:visible',

    /** Selector for the "New Upload" menu item in the Quick Create dropdown. */
    newUploadMenuItem: 'a[role="menuitem"][href="/uploads/new"]:visible',
  },

  // ------------------------ SEARCH PAGE ------------------------

  /**
   * Locators for the Search Results Page.
   * Includes selectors for result containers and elements displaying search output.
   * @property {string} searchResultList - Selector for the section containing the list of search results.
   */

  searchPage: {
    searchResultList: 'section[aria-label="Search results"]',
  },

  // ------------------------ UPLOAD PAGE ------------------------

  /**
   * Locators for the Upload Page.
   *
   * This section contains selectors for metadata fields, upload controls,
   * file management actions, navigation tabs, and toast messages.
   * Each locator is used to automate user interactions during record creation and editing.
   * @property {string} titleField - Selector for the title input field in the metadata form.
   * @property {string} descriptionField - Selector for the record description textarea.
   * @property {string} metadataOnlyCheckbox - Selector for the "Metadata-only record" checkbox.
   * @property {string} resourceTypeDropdown - Selector for the resource type dropdown.
   * @property {(optionText: string) => string} resourceTypeOption - Returns a selector for a specific resource type option.
   * @property {string} addCreatorButton - Selector for the "Add creator" button.
   * @property {string} familyNameField - Selector for the creator's family name input field.
   * @property {string} givenNameField - Selector for the creator's given name input field.
   * @property {string} saveAddCreatorButton - Selector for the button that saves the newly added creator.
   * @property {string} publicationDateField - Selector for the publication date input field.
   * @property {string} uploadButton - Selector for the file upload input element.
   * @property {(filename: string) => string} uploadedFile - Returns a selector for an uploaded file by its name.
   * @property {string} removeFileButton - Selector for the button that removes an uploaded file.
   * @property {string} saveDraftButton - Selector for the "Save draft" button.
   * @property {string} publishButton - Selector for the "Publish" button.
   * @property {string} editButton - Selector for the "Edit" button.
   * @property {string} deleteButton - Selector for the "Delete record" button.
   * @property {string} confirmDeleteButton - Selector for the confirmation button in the delete modal.
   * @property {string} discardChangesButton - Selector for the "Discard" button.
   * @property {string} previewButton - Selector for the "Preview" button.
   * @property {string} backToEditButton - Selector for the "Back to edit" button.
   * @property {(text: string) => string} toastMessage - Returns a selector for a toast notification containing given text.
   * @property {string} recordTitleHeader - Selector for the record title header displayed on the page.
   * @property {string} communityInputField - Selector for the input used to search and select a community.
   * @property {(communityName: string) => string} communityOption - Returns a selector for a community option in the dropdown.
   * @property {string} embargoRadioButton - Selector for the "Embargo" radio button.
   * @property {string} embargoDateInput - Selector for the embargo date input field.
   * @property {string} metadataTab - Selector for the "Metadata" tab button.
   * @property {string} filesTab - Selector for the "Files" tab button.
   * @property {string} permissionsTab - Selector for the "Permissions" tab button.
   * @property {string} additionalDescription - Selector for the "Additional description" field.
   * @property {string} subjectsInput - Selector for the "Subjects" input field.
   * @property {string} languagesDropdown - Selector for the languages dropdown.
   * @property {(lang: string) => string} languagesOption - Returns a selector for a specific language option.
   * @property {string} accessDropdown - Selector for the access level dropdown.
   * @property {(optionText: string) => string} accessOption - Returns a selector for an access option by visible text.
   * @property {string} successMessage - Selector for a success message toast element.
   * @property {string} discardModalConfirmButton - Selector for the "Discard" button inside the discard confirmation dialog.
   * @property {string} filesSectionDropzone - Selector for the dropzone area where files can be uploaded.
   * @property {string} selectedCommunityLabel - Selector for the label showing the currently selected community.
   * @property {string} browseFilesButton - Selector for the "Browse" button in the Uppy dashboard.
   * @property {string} uploadFilesButton - Selector for the "Upload" button in the Uppy status bar.
   * @property {string} warningMessage - Selector for warning messages displayed in the upload form.
   * @property {string} fieldWithError - Selector for form fields that contain an error state.
   * @property {string} errorMessageInsideField - Selector for the error message displayed inside a field.
   * @property {() => string} uploadCompleteBar - Returns a selector for the upload progress bar when it reaches 100%.
   */

  uploadPage: {
    /** Selector for the title input field in the metadata form. */
    titleField: "#metadata\\.title",

    /** Selector for the description textarea. */
    descriptionField: 'textarea[name="description"]',

    /** Selector for the "Metadata-only record" checkbox. */
    metadataOnlyCheckbox: 'div.ui.checkbox:has-text("Metadata-only record")',

    /** Selector for the resource type dropdown. */
    resourceTypeDropdown: '[name="metadata.resource_type"]',

    /**
     * Returns a selector for a resource type option based on its visible text.
     * @param optionText The visible text of the resource type option.
     * @returns The XPath selector for the matching resource type option element.
     */
    resourceTypeOption: (optionText: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${optionText}")]`,

    /** Selector for the "Add creator" button. */
    addCreatorButton: 'button:has-text("Add creator")',

    /** Selector for the creator’s family name input. */
    familyNameField: 'input[name="person_or_org.family_name"]',

    /** Selector for the creator’s given name input. */
    givenNameField: 'input[name="person_or_org.given_name"]',

    /** Selector for the "Save" button in the Add Creator modal. */
    saveAddCreatorButton: 'button[name="submit"].ui.primary.button',

    /** Selector for the publication date input field. */
    publicationDateField: "input#metadata\\.publication_date",

    /** Selector for the file input used to upload files. */
    uploadButton: 'input[type="file"]',

    /**
     * Returns a selector for an uploaded file by its filename.
     * @param filename Name of the uploaded file.
     * @returns Selector for the uploaded file element.
     */
    uploadedFile: (filename: string) => `.uppy-Dashboard-Item-name:has-text("${filename}")`,

    /** Selector for the button that removes an uploaded file. */
    removeFileButton: '[data-testid="remove-file"]',

    /** Selector for the "Save draft" button. */
    saveDraftButton: 'button:has-text("Save draft")',

    /** Selector for the "Publish" button. */
    publishButton: 'button:has-text("Publish")',

    /** Selector for the "Edit" button. */
    editButton: 'button:has-text("Edit")',

    /** Selector for the "Delete record" button. */
    deleteButton: 'button:has-text("Delete record")',

    /** Selector for the confirmation button inside the delete modal. */
    confirmDeleteButton: 'button:has-text("Delete")',

    /** Selector for the "Discard changes" button. */
    discardChangesButton: 'button:has-text("Discard")',

    /** Selector for the "Preview" button. */
    previewButton: 'button:has-text("Preview")',

    /** Selector for the "Back to edit" button. */
    backToEditButton: 'button:has-text("Back to edit")',

    /**
     * Returns a selector for a toast notification containing given text.
     * @param text Text contained in the toast message.
     * @returns Selector for the toast element.
     */
    toastMessage: (text: string) => `[role="status"]:has-text("${text}")`,

    /** Selector for the record title displayed on the page. */
    recordTitleHeader: "#record-title",

    /** Selector for the input field to select a community. */
    communityInputField: '[aria-labelledby="community-selection-label"] input',

    /**
     * Returns a selector for a community option in the dropdown.
     * @param communityName communityName The name of the community to be selected in the dropdown.
     * @returns The XPath selector for the community option element in the dropdown.
     */
    communityOption: (communityName: string) => `ul[role="listbox"] >> text=${communityName}`,

    /** Radio button to select embargo access for the record. */
    embargoRadioButton: '[data-testid="embargo-access-radio-button"]',

    /** Input field to set the embargo end date. */
    embargoDateInput: '[name="embargo-until"]',

    /** Button to switch to the Metadata tab. */
    metadataTab: 'button:has-text("Metadata")',

    /** Button to switch to the Files tab. */
    filesTab: 'button:has-text("Files")',

    /** Button to switch to the Permissions tab. */
    permissionsTab: 'button:has-text("Permissions")',

    /** Input for additional description text. */
    additionalDescription: '[name="additional_description"]',

    /** Input for the subjects field. */
    subjectsInput: '[name="subjects"]',

    /** Dropdown to select languages for the record. */
    languagesDropdown: '[name="languages"]',

    /**
     * Returns a selector for a language option by visible text.
     * @param lang The language name to select.
     * @returns Selector for the language option element.
     */
    languagesOption: (lang: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${lang}")]`,

    /** Dropdown to select access rights for the record. */
    accessDropdown: '[name="access_right"]',

    /**
     * Returns a selector for an access option by visible text.
     * @param optionText The access option name to select.
     * @returns Selector for the matching access option element.
     */
    accessOption: (optionText: string) =>
      `//div[contains(@role, "listbox")]//div[contains(text(), "${optionText}")]`,

    /** Selector for a success toast message. */
    successMessage: '[role="status"]:has-text("successfully")',

    /** Button to confirm discarding changes in the modal. */
    discardModalConfirmButton: 'div[role="dialog"] button:has-text("Discard")',

    /** Dropzone area for uploading files. */
    filesSectionDropzone: '[data-testid="files-dropzone"]',

    /** Label showing the currently selected community. */
    selectedCommunityLabel: '[data-testid="community-label"]',

    /** Button to browse files in the Uppy file uploader. */
    browseFilesButton: "button.uppy-Dashboard-browse",

    /** Button to start uploading selected files. */
    uploadFilesButton: "button.uppy-StatusBar-actionBtn--upload",

    /** Element displaying a warning message on the upload page. */
    warningMessage: "#warning-feedback-div[i.exclamation",

    /** Form field container indicating an error state. */
    fieldWithError: "div.field.error",

    /** Error message displayed inside invalid form fields. */
    errorMessageInsideField: "div.ui.pointing.prompt.label",

    /**
     * Returns a selector for the progress bar when upload reaches 100%.
     * @returns Selector for the completed upload progress bar.
     */
    uploadCompleteBar: () => `.file-upload-progress[data-percent="100"]`,
  },

  // ------------------------ PREVIEW PAGE ------------------------

  /**
   * Locators for the Preview Page section.
   * Contains draft messages, record description, uploaded files,
   * and metadata display elements.
   * @property {string} saveDraftInfoMessage - Selector for the informational message displayed when a draft is saved.
   * @property {string} saveDraftVersionsInfoMessage - Selector for the informational message showing draft versions.
   * @property {string} recordDescription - Container element for the record description text.
   * @property {string} uploadedFilesRows - Rows of the uploaded files table.
   * @property {string} resourceType - Selector for displaying the resource type of the record.
   * @property {string} creator - Selector for the list of creators of the record.
   * @property {string} metadataOnlyLabel - Label indicating the record is metadata-only (no files available).
   */

  previewPage: {
    /** Selector for the informational message displayed when a draft is saved. */
    saveDraftInfoMessage: "div.ui.info.flashed.bottom.attached.manage.message",

    /** Selector for the informational message showing draft versions. */
    saveDraftVersionsInfoMessage: "div.ui.info.message.no-border-radius.m-0",

    /** Container element for the record description text. */
    recordDescription: "#description > div",

    /** Rows of the uploaded files table. */
    uploadedFilesRows: "table.ui.striped.table.files.fluid.open tbody tr",

    /** Selector for displaying the resource type of the record. */
    resourceType: 'dl.details-list dt:has-text("Resource type") + dd',

    /** Selector for the list of creators of the record. */
    creator: "#creatibutors ul.creatibutors li .creatibutor-name",

    /** Label indicating the record is metadata-only (no files available). */
    metadataOnlyLabel:
      'span[aria-label="No files are available for this record."]:has-text("Metadata-only")',
  },

  // ------------------------ NEW COMMUNITY PAGE ------------------------

  /**
   * Locators for the New Community Page section.
   * Covers page title, input fields, buttons, and radio selections for community creation.
   * @property {string} pageTitle - Header element of the page "Setup your new community".
   * @property {string} communityNameField - Input field for entering the community name.
   * @property {string} communityIdentifierField - Input field for the community identifier/slug.
   * @property {string} newCommunityButton - Button to initiate creation of a new community.
   * @property {string} publicRadio - Radio button to select public visibility.
   * @property {string} restrictedRadio - Radio button to select restricted visibility.
   * @property {string} createCommunityButton - Button to finalize creation of the community.
   * @property {string} communityNameHeader - Header element showing the community name after creation.
   */

  newCommunityPage: {
    /** Header element of the page "Setup your new community". */
    pageTitle: 'h1:has-text("Setup your new community")',

    /** Input field for entering the community name. */
    communityNameField: "#metadata\\.title",

    /** Input field for the community identifier/slug. */
    communityIdentifierField: "#slug",

    /** Button to initiate creation of a new community. */
    newCommunityButton: 'button:has-text("New community")',

    /** Radio button to select public visibility for the community. */
    publicRadio: '(//input[@type="radio" and @value="public"])[1]',

    /** Radio button to select restricted visibility for the community. */
    restrictedRadio: '(//input[@type="radio" and @value="restricted"])[1]',

    /** Button to finalize creation of the community. */
    createCommunityButton: "button.ui.icon.positive.left.labeled.button",

    /** Header element showing the community name after creation. */
    communityNameHeader: "h1.ui.medium.header.mb-0",
  },

  // ------------------------ COMMUNITIES PAGE ------------------------

  /**
   * Locators for the Communities Page section.
   * Contains page title, search functionality, community cards, and tabs.
   * @property {string} pageTitle - Header of the Communities page.
   * @property {string} firstCommunityCard - First community card displayed on the page.
   * @property {string} recordsTab - Tab to view records of a selected community.
   * @property {string} searchField - Search input field for communities.
   * @property {string} searchButton - Button to perform the search action.
   * @property {string} communityNameLink - Link element for the community name.
   */

  communitiesPage: {
    /** Header of the Communities page. */
    pageTitle: 'h1:has-text("Communities")',

    /** First community card displayed on the page. */
    firstCommunityCard: "div.centered.image.fallback_image",

    /** Tab to view records of a selected community. */
    recordsTab: 'a.item.active:has-text("Records")',

    /** Search input field for communities. */
    searchField: 'input[name="q"]',

    /** Button to perform the search action. */
    searchButton: 'button[type="submit"]',

    /** Link element for the community name. */
    communityNameLink: "a.ui.medium.header.mb-0",
  },

  // ------------------------ COMMUNITY SEARCH PAGE ------------------------

  /**
   * Locators for the Community Search Page section.
   * Contains selectors for sorting dropdowns and options in the search results.
   * @property {string} sortDropdown - Dropdown to sort community search results.
   * @property sortOption - Returns a selector for a specific sort option.
   * @property {string} sortOptionSelected - Selector for the currently selected sort option.
   */

  communitySearchPage: {
    /** Dropdown to sort community search results. */
    sortDropdown: '(//div[@aria-label="Sort" and contains(@class, "ui selection dropdown")])[2]',

    /**
     * Returns a selector for a specific sort option in the dropdown.
     * @param option The visible name of the sort option to select.
     * @returns Selector for the sort option element.
     */
    sortOption: (option: string) =>
      `//div[contains(@class,"visible menu")]/div[@role="option"]/span[text()="${option}"]`,

    /** Selector for the currently selected sort option. */
    sortOptionSelected: '//div[@aria-label="Sort"]//div[contains(@class,"divider text")]',
  },

  // ------------------------ COMMUNITY DETAIL PAGE ------------------------

  /**
   * Locators for the Community Detail Page section.
   * Contains navigation tabs, fields, buttons, and verification elements for community details.
   * @property recordsTab - Selector for the "Records" navigation tab.
   * @property membersTab - Selector for the "Members" navigation tab.
   * @property settingsTab - Selector for the "Settings" navigation tab.
   * @property curationPolicyTab - Selector for the "Curation policy" navigation tab.
   * @property aboutTab - Selector for the "About" navigation tab.
   * @property privilegesTab - Selector for the "Privileges" section/tab.
   * @property reviewPolicyTab - Selector for the "Review Policy" tab.
   * @property pagesTab - Selector for the "Pages" tab.
   * @property closedRequestsButton - Selector for the "Closed Requests" button.
   * @property communityNameInput - Input field for the community name.
   * @property deleteMembersCheckbox - Checkbox to confirm deletion of members.
   * @property deleteRecordsCheckbox - Checkbox to confirm deletion of records.
   * @property deleteSlugCheckbox - Checkbox to confirm deletion of slug.
   * @property deleteIdentifierLabel - Label displaying the identifier to confirm deletion.
   * @property deleteIdentifierInput - Input field to enter identifier for deletion.
   * @property memberField - Field to select community members.
   * @property roleCheckbox - Function returning selector for a specific member role checkbox.
   * @property curationPolicyIframe - Iframe for editing curation policy content.
   * @property aboutPageIframe - Iframe for editing the "About" page content.
   * @property headerCommunityName - Header element showing the community name.
   * @property roleDropdown - Dropdown to select member roles.
   * @property visibilityDropdown - Dropdown to select community visibility.
   * @property saveButton - Button to save changes.
   * @property deleteCommunityButton - Button to trigger community deletion.
   * @property permanentlyDeleteButton - Button to permanently delete the community.
   * @property acceptAndPublishButton - Button to accept changes and publish.
   * @property inviteButton - Button to open the invite members modal.
   * @property inviteConfirmButton - Button to confirm inviting members.
   * @property leaveButton - Button to leave the community.
   * @property removeButton - Button to remove a member from the community.
   * @property saveButtonPrivileges - Button to save privilege changes.
   * @property saveButtonPages - Button to save page content.
   * @property viewAllVersionsSlider - Slider to view all record versions.
   * @property restrictedLabel - Label indicating restricted access.
   * @property noRestrictedRecords - Message displayed when no restricted records exist.
   * @property communityMember - Function returning selector for a member based on email.
   * @property youLabel - Label indicating the current user.
   * @property curationPolicyText - Text content of the curation policy.
   * @property aboutText - Text content of the "About" section.
   * @property leaveCommunityMessage - Message shown when leaving a community.
   * @property recordManagementMenu - Selector for the record management menu.
   * @property accessStatusCheckbox - Function returning selector for an access status checkbox.
   * @property numberLabel - Generic number label element.
   */

  communityDetailPage: {
    // Navigation ----------------------------------

    /** Selector for the "Records" navigation tab */
    recordsTab: 'a.item.active:has-text("Records")',

    /** Selector for the "Members" navigation tab */
    membersTab: 'a.item:has-text("Members")',

    /** Selector for the "Settings" navigation tab */
    settingsTab: 'a.item:has-text("Settings")',

    /** Selector for the "Curation policy" navigation tab */
    curationPolicyTab: 'a.item:has-text("Curation policy")',

    /** Selector for the "About" navigation tab */
    aboutTab: 'a.item:has-text("About")',

    /** Selector for the "Privileges" section/tab */
    privilegesTab: "#privileges",

    /** Selector for the "Review Policy" tab */
    reviewPolicyTab: 'a#curation_policy.item[role="tab"]',

    /** Selector for the "Pages" tab */
    pagesTab: "#pages",

    /** Selector for the "Closed Requests" button */
    closedRequestsButton: 'button.request-search-filter:has-text("Closed")',

    // Fields ----------------------------------

    /** Input field for the community name */
    communityNameInput: "#metadata\\.title",

    /** Checkbox to confirm deletion of members */
    deleteMembersCheckbox: 'label[for="members-confirm"]',

    /** Checkbox to confirm deletion of records */
    deleteRecordsCheckbox: 'label[for="records-confirm"]',

    /** Checkbox to confirm deletion of slug */
    deleteSlugCheckbox: 'label[for="slug-confirm"]',

    /** Label displaying the identifier to confirm deletion */
    deleteIdentifierLabel: 'label[for="confirm-delete"] strong',

    /** Input field to enter identifier for deletion */
    deleteIdentifierInput: "#confirm-delete",

    /** Field to select community members */
    memberField: 'div.field:has-text("Member") div.ui.fluid.multiple.search.selection.dropdown',

    /**
     * Returns a selector for a member role checkbox by index
     * @param index Index of the checkbox in the members list
     * @returns Selector for the member role checkbox
     */

    roleCheckbox: (index: number) =>
      `(//div[@id="members-users-tab-panel"]//div[contains(@class, "checkbox")])[${index}]`,

    /** Iframe for editing curation policy content */
    curationPolicyIframe: '(//div[@class="tox-edit-area"])[1]',

    /** Iframe for editing the "About" page content */
    aboutPageIframe: '(//div[@class="tox-edit-area"])[2]',

    /** Header element showing the community name */
    headerCommunityName: "h1.ui.medium.header.mb-0",

    /** Dropdown to select member roles */
    roleDropdown: '//div[@aria-label="Role owner"]',

    /** Dropdown to select community visibility */
    visibilityDropdown: '//div[@aria-label="Visibility Hidden" or @aria-label="Visibility Public"]',

    // Buttons ----------------------------------

    /** Button to save changes */
    saveButton: "button.ui.icon.primary.left.labeled.button",

    /** Button to trigger community deletion */
    deleteCommunityButton: "#delete-community-button",

    /** Button to permanently delete the community */
    permanentlyDeleteButton: 'button.ui.negative.button:has-text("Permanently delete")',

    /** Button to accept changes and publish */
    acceptAndPublishButton: 'button:has-text("Accept and publish")',

    /** Button to open the invite members modal */
    inviteButton: "button.ui.tiny.compact.fluid.icon.positive.left.labeled",

    /** Button to confirm inviting members */
    inviteConfirmButton: 'button.ui.icon.primary.left.labeled.button:has-text("Invite")',

    /** Button to leave the community */
    leaveButton: "button.ui.tiny.compact.fluid.icon.negative.left.labeled.button",

    /** Button to remove a member from the community */
    removeButton: 'button.ui.tiny.compact.fluid.icon.left.labeled.button:has-text("Remove...")',

    /** Button to save privilege changes */
    saveButtonPrivileges: "button.ui.icon.primary.toggle.left.labeled.button",

    /** Button to save page content */
    saveButtonPages: '//button[@type="submit"]',

    /** Slider to view all record versions */
    viewAllVersionsSlider: 'label:text("View all versions")',

    // Verification ----------------------------------

    /** Label indicating restricted access */
    restrictedLabel: "div.ui.small.horizontal.label.access-status.restricted",

    /** Message displayed when no restricted records exist */
    noRestrictedRecords: 'h2.ui.header:has-text("We couldn\'t find any matches for your search")',

    /**
     * Returns a selector for a community member based on email
     * @param email Email of the member
     * @returns Selector for the member element
     */

    communityMember: (email: string) => `tr.community-member-item >> text=${email}`,

    /** Label indicating the current user */
    youLabel: 'div.ui.tiny.label.primary:has-text("You")',

    /** Text content of the curation policy */
    curationPolicyText: ".ui.text.container.rich-input-content.rel-m-2.rel-pt-1",

    /** Text content of the "About" section */
    aboutText: ".ui.text.container.rel-m-2.rel-pt-1",

    /** Message shown when leaving a community */
    leaveCommunityMessage: '//div[@class="ui placeholder center aligned segment"]',

    /** Selector for the record management menu */
    recordManagementMenu: '//div[@id="recordManagement"]',

    /**
     * Returns a selector for an access status checkbox by status name
     * @param status Access status name (e.g., "Hidden", "Public")
     * @returns Selector for the access status checkbox element
     */

    accessStatusCheckbox: (status: string) =>
      `(//input[@aria-label="${status}"]/ancestor::div[contains(@class,"checkbox")])[2]`,

    /** Generic number label element */
    numberLabel: '//div[@class="ui label"]',
  },

  // ------------------------ MY DASHBOARD PAGE ------------------------

  /**
   * Locators for the My Dashboard Page section.
   * Contains navigation links, action buttons, and verification selectors.
   * @property {string} communitiesLink - Link to the user's communities page.
   * @property {string} requestsLink - Link to the user's requests page.
   * @property {string} firstRecordDetail - First record detail link.
   * @property {string} firstCommunityCard - First community card element.
   * @property {string} recordsTab - Tab showing user's records.
   * @property {string} editFirstRecordButton - Button to edit the first record.
   * @property {(index: number) => string} acceptButton - Returns selector for accept button at given index
   * @property {(index: number) => string} declineButton - Returns selector for decline button at given index
   * @property {string} acceptConfirmButton - Button to confirm accepting a request.
   * @property {string} declineConfirmButton - Button to confirm declining a request.
   * @property {string} versionsToggle - Toggle button for version view.
   * @property {(index: number) => string} recordTitle - Returns selector for decline button at given index
   * @property {string} allDoneMessage - Message displayed when all tasks are done.
   * @property {string} newVersionDraftLabel - Label indicating a new draft version.
   */

  myDashboardPage: {
    // Navigation ----------------------------------

    /** Link to the user's communities page */
    communitiesLink: 'a.item[href="/me/communities"]',

    /** Link to the user's requests page */
    requestsLink: 'a:has-text("Requests")',

    /** First record detail link */
    firstRecordDetail: "a.truncate-lines-2",

    /** First community card element */
    firstCommunityCard: "div.centered.image.fallback_image",

    /** Tab showing user's records */
    recordsTab: 'a.item.active:has-text("Records")',

    // Buttons ----------------------------------

    /** Button to edit the first record */
    editFirstRecordButton:
      '(//button[contains(@class, "ui small compact icon right floated left labeled button") and .//text()="Edit"])[1]',

    /** Returns selector for the accept button by index. */
    acceptButton: (index: number) => `button:has-text("Accept") >> nth=${index}`,

    /** Returns selector for the decline button by index. */
    declineButton: (index: number) => `button:has-text("Decline") >> nth=${index}`,

    /** Button to confirm accepting a request */
    acceptConfirmButton:
      '#accept .actions > button.ui.icon.positive.left.labeled.button:has-text("Accept")',

    /** Button to confirm declining a request */
    declineConfirmButton:
      '.actions > button.ui.icon.negative.left.labeled.button:has-text("Decline")',

    /** Toggle button for version view */
    versionsToggle: '(//div[@class="ui toggle checkbox"]/label)[2]',

    // Verification ----------------------------------

    /** Returns selector for record by title text. */
    recordTitle: (title: string) => `text=${title}`,

    /** Message displayed when all tasks are done */
    allDoneMessage:
      'div.ui.placeholder.center.aligned.segment h1.ui.icon.header:has-text("All done!")',

    /** Label indicating a new draft version */
    newVersionDraftLabel: 'text="New version draft"',
  },

  // ---------------------------- LOGIN ----------------------------

  /**
   * Locators for the Login Page section.
   * Contains input fields and submit button for authentication.
   * @property {string} usernameField - Input field for the user's email.
   * @property {string} passwordField - Input field for the user's password.
   * @property {string} submitButton - Button to submit login credentials.
   */

  loginPage: {
    /** Input field for the user's email */
    usernameField: "input#email",

    /** Input field for the user's password */
    passwordField: "input#password",

    /** Button to submit login credentials */
    submitButton: 'button[type="submit"]',
  },

  // ---------------------------- FOOTER ----------------------------

  /**
   * Locators for the Footer section.
   * Contains language selector elements.
   * @property {string} languageSelector - Dropdown to select language.
   * @property {string} languageOption - Option inside the language selector dropdown.
   */

  footer: {
    /** Dropdown to select language */
    languageSelector: '.language-selector, [data-bs-toggle="dropdown"].language',

    /** Option inside the language selector dropdown */
    languageOption: ".language-selector a, .dropdown-menu a[data-locale]",
  },
};
