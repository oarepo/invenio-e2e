/**
 * This module defines locators for various elements in the Invenio E2E tests.
 * It provides a structured way to access elements on the page using CSS selectors.
 */
export const locators = {
    header: {
        logoLink: '#invenio-nav a.logo-link',
    },
    navigation: {
        homeLink: 'nav a[href="/"], .navbar a[href="/"], header a[href="/"]',
        searchLink: 'nav a[href*="search"], .navbar a[href*="search"], header a[href*="search"]',
    },
    homePage: {
        searchField: 'input[name="q"]',
        searchButton: 'button[type="submit"]',
        searchPlaceholder: 'input[placeholder]',
        repositoryName: 'h1, .site-title, .logo-text',
    },
    searchPage: {
        searchResultList: 'section[aria-label="Search results"]',
        searchInput: '.search-input',
    },
    footer: {
        languageSelector: '.language-selector, .footer .dropdown, .footer [class*="language"]',
        languageOption: '.dropdown .item, .language-option',
    }
}