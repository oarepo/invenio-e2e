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
        usernameField: 'input#email',
        passwordField: 'input#password',
        submitButton: 'button[type="submit"]',
    }
}