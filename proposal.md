Just a bunch of notes, no real proposal yet.

# Terminology

Locator
: An identifier of an element on a page, such as a CSS selector.

Page
: An abstraction of a web page (or a sequence of pages in SPA). Operations:
    - `openPage(optional url)`: Open a page, defaulting to the base URL of the page. Includes validation that the page has been loaded successfully.
    - `validatePageLoaded()`: Explicitly validate that the page has been loaded.
    - `FIELDS` - methods to access input fields on the page, such as `fillSearchField(...)`
    - `BUTTONS` (ACTIONS???) - methods to click on a button. These always return a new Page
    - `FLOWS` - methods to represent a sequence of actions or steps in a process that begins at this page.

Service
: An abstraction of a service that is orthogonal to the page and provides functionality other than plain selectors (a sequence of steps that must be performed). From tests it is always called through a page's method

Fixture
: instances of pages, locators and services that are used in tests. They are created by the test framework and passed to the test methods.

Test
: A test uses Page fixtures to perform actions and validate results. It never uses service fixtures nor locators directly.


# We will provide the following fixtures:

* locators
* initialLocale - the initial locale of the application, used to set up the test environment.
   * if set, it would set the "accept-language" header of the browser fixture
* i18nService(depends on initialLocale, page, locators) - a service that provides i18n functionality:
    * {
        "invenio-rdm-records": i18next("invenio-rdm-records.messages")
        "test": i18next("tests.messages")
        - for all invenio packages that provide i18n
    }
    * switchLocale(locale: string)
    * currentLocale
    * get_localized_text(key: string, messageCatalogue: string)
* browser({originalBrowser, initialLocale})
* loginService(depends locators, page)
    * isUserLoggedIn(): boolean
    * login(username: string, password: string):
* services({i18nService, loginService})
   return {i18n: i18nService, login: loginService}
* expect: fixture around playwright's expect with additional matchers
   expect({services, originalExpect}, use):
      return originalExpect.extend({
        toHaveI18nText: (value) => {
            // implementation of the matcher using services.i18n
        }
* ...registerPage(name, pageClass)
   pageClass({page, locators, availablePages, services, expect})

```
import { expect } from "@inveniosoftware/invenio-e2e";


test = base.extend({
    expect: expect,
});

i18ntest = test.extend({
    expect: async ({ expect as previous, services }, use) => {
        await use(expect.extend({
            toHaveI18nText: (value) => {
                services.i18n.something_with(value)
            }
        })
})

whole_test = i18ntest.extend({
    ...registerPage("homepage", HomePage),
    expect: async ({ expect as previous, i18n }, use) => {
        await use(expect.extend({
            toHaveSomethingElse: (value) => {
            }
        })
});

class SearchPage:
   constructor({..., protected services, protected expect})

    function verifyBlah() {}
        this.expect(locators.status).toHaveI18nText("Open", "python" | "invenio-rdm-records-ui" | "tests")
    }

```

```typescript

myTest = test.extend({
    initialLocale: "cs"
});

allInvenioTests(myTest);




```