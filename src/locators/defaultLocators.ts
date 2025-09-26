/**
 * This module defines locators for various elements in the Invenio E2E tests.
 * It provides a structured way to access elements on the page using CSS selectors.
 */
export const locators = {
  header: {
    logoLink: '#invenio-nav a.logo-link, a[href="/"]',
    logInButton: 'a[href^="/login/"]',
  },
  homePage: {
    searchField: 'input[name="q"]',
    searchButton: 'button[type="submit"]',
  },
  searchPage: {
    searchResultList: 'section[aria-label="Search results"]',
  },
  loginPage: {
    usernameField: "input#email",
    passwordField: "input#password",
    submitButton: 'button[type="submit"]',
  },
  footer: {
    languageSelector: '.language-selector, [data-bs-toggle="dropdown"].language',
    languageOption: ".language-selector a, .dropdown-menu a[data-locale]",
  },

  // ----------------------- RECORD DETAIL PAGE -----------------------

  recordDetailPage: {
    // HEADERS
    recordTitle: "#record-title",
    citationText: '//div[@id="citation-text"]/div[text()]',

    // NAVIGATION
    versionLink: (version: string) => 'div.item a.text-break:has-text("Version ${version}")',
    versionV1Link: 'div.item a.text-break:has-text("Version v1")',

    // BUTTONS
    editButton: "#recordManagement > div > div:nth-child(1) > button",
    editButtonByRole: { role: "button", name: "Edit" },

    newVersionButton: "#recordManagement > div > div:nth-child(2) > span > button",
    newVersionButtonByRole: { role: "button", name: "New version" },

    shareButton: '//div[@id="recordManagement"]//button[contains(@class, "ui") and contains(text(), "Share")]',
    shareButtonByRole: { role: "button", name: "Share" },

    exportSelectionButton: 'label:has-text("Export selection") i',
    exportButton: { role: "button", name: "Export" },

    downloadAllButton: '//th/a[@role="button"][contains(@class,"archive-link")]',
    previewButton: '//span/a[@role="button"][contains(@class,"preview-link")]',
    downloadButton: '//span/a[@role="button"][not(contains(@class,"preview"))]',

    // CITATION DROPDOWN
    citationDropdown: ".ui.selection.dropdown.citation-dropdown",
    citationDropdownOption: (style: string) => '.menu .item:has-text("${style}")',
    citationDropdownSelected: (style: string) => '.ui.selection.dropdown.citation-dropdown .divider.text:has-text("${style}")',
    citationSelectedStyle:
      ".ui.selection.dropdown.citation-dropdown .divider.text",

    // EXPORT DROPDOWN
    exportDropdown: '//div[@aria-label="Export selection"]',
    exportDropdownExpanded: '//div[@aria-label="Export selection"][@aria-expanded="true"]',
    exportDropdownOption: (style: string) => '.item span.text:has-text("${style}")',

    // VERIFICATION
    versionV2Item: 'div.item.version.active >> div.left.floated.content >> span.text-break:text("Version v2")',
    versionV1Label: 'span.label.text-muted:has-text(" | Version v1")',

    embargoedLabel: "span.ui.label.horizontal.small.access-status.embargoed.mb-5",
    embargoedStatusSection: "section#record-access-status.ui.warning.message.rel-mt-1",

    restrictedLabel: "span.ui.label.horizontal.small.access-status.restricted.mb-5",
    restrictedStatusSection: "section#record-access-status.ui.negative.message.rel-mt-1",
    restrictedMessage: "div.ui.negative.message.file-box-message",

    previewContainer: "div#files-preview-accordion-panel.active.content.preview-container.open",
    previewIframe: "div#files-preview-accordion-panel iframe#preview-iframe",
  },
};
