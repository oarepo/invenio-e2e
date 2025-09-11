# Demo of Invenio E2E tests for TU Graz

## Installation (when `@inveniosoftware/invenio-e2e` goes public)

```bash
npm install
```

## Current Installation

```bash

gh repo clone oarepo/invenio-e2e
gh repo clone mesemus/tugraz-demo

# this one is required for local installation of invenio-e2e
export NODE_PRESERVE_SYMLINKS=1

cd invenio-e2e
npm install
npm run build
cd ..

cd tugraz-demo
npm install
```

## Running the tests

```bash
npx playwright test
```

## Customizing the tests

### Customizing UI locators

The locators used in the tests can be customized by modifying the default ones provided by the `@inveniosoftware/invenio-e2e` package. To do so, look at the [`locators/index.ts`](./locators/index.ts) file.

You need to customize the locators if you modified the UI templates of Invenio RDM in a way that the locators used in the tests do not match anymore.

After modifications, you need to add the locator to the fixtures in the [`fixtures/index.ts`](./fixtures/index.ts) file, so that the tests can use them.

### Running the default tests

To run the default tests provided by the `@inveniosoftware/invenio-e2e` package, just run the `npx playwright test` command as usual, no need to specify any test files.

### Adding new tests

Add your tests inside the `tests` directory as you would normally do. Inside the tests you can use the fixtures provided by the `@inveniosoftware/invenio-e2e` package, as well as the custom fixtures defined in the `fixtures/index.ts` file.

List of provided fixtures (for full list, refer to the documentation of the `@inveniosoftware/invenio-e2e` package):

| Fixture Name | Description |
|--------------|-------------|
| `page` | The Playwright page object. |
| `basePageLocators` | The base locators used in the tests. |
| `homePageLocators` | The locators for the home page. |
| `homePage` | The home page object. |
| `searchPage` | The search page object. |
| `availablePages` | An object to store the available page objects. |


### Selecting the tests to be run

TODO: You can select subset of the tests provided by @inveniosoftware/invenio-e2e by passing the 'skip' parameter to the `homepageTests` or `communityTests` functions inside the [`tests/invenio.spec.ts`](./tests/invenio.spec.ts) file. For example:

```typescript
homepageTests(test, { skip: ['search', 'browse'] });
```

### Customizing playwright page objects

You can extend the provided page objects from the `@inveniosoftware/invenio-e2e` package by creating your own page objects that extend the provided ones. For example, you can create a new page object that extends the `HomePage` class and adds custom methods or locators.

Do not forget to add your custom page object to the fixtures in the `fixtures/index.ts` file, so that the tests can use it.

This page will replace the default page and even the default tests inside the `@inveniosoftware/invenio-e2e` package will use it.