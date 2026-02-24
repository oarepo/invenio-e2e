# E2E Testing Framework for Invenio

**Note:** This is a suggestion only; it might be changed or abandoned at any time.

## Dependencies

- [Node.js](https://nodejs.org/en/) (v20.11.0 or higher)
- [pnpm](https://pnpm.io/) (v9.0.0 or higher)

## How to Try It Out

### Directory Structure

At the beginning, you have just your repository:

```text
parent-directory
  +-- <my-repository>
        +-- site
```

You will need to change it to the following structure:

```text
parent-directory
  +-- <my-repository>
         +-- e2e
         +-- site
  +-- invenio-e2e
         +-- ...
  +-- pnpm-workspace.yaml
```

### Steps

1. Create a `pnpm-workspace.yaml` file in parent directory:

    ```yaml
    # pnpm-workspace.yaml
    packages:
      - <my-repository>/e2e
      - invenio-e2e
    ```

2. Clone the `invenio-e2e` repository from GitHub:

    ```bash
    gh repo clone oarepo/invenio-e2e
    # Switch to a feature branch if needed
    ```

3. Create the `e2e` directory inside your repository:

    ```bash
    cp -r invenio-e2e/e2e <my-repository>/e2e
    ```

4. Install dependencies:

    ```bash
    cd <my-repository>/e2e
    pnpm install
    ```

5. Configure environment variables (see `src/config/env.ts` for all options):

    You will need a test user that can deposit records in your InvenioRDM instance.

    ```bash
    export INVENIO_USER_EMAIL=...
    export INVENIO_USER_PASSWORD=...
    ```

6. Run your server in another terminal:

    ```bash
    cd <my-repository>
    invenio-cli run
    ```

7. Run tests:

    ```bash
    cd <my-repository>/e2e
    npx playwright test
    ```

## API Testing

The project also ships with a lightweight API regression suite that reuses the same authentication helpers as the UI tests.

### InvenioRDM Instance Setup

Add this to your `invenio.cfg` to enable API testing:

```python
# invenio.cfg

RECORDS_RESOURCES_FILES_ALLOWED_DOMAINS = [
    "inveniordm.docs.cern.ch",
]
```

Setup a test user and admin (and possibly other users) in your InvenioRDM instance with the credentials matching those in your environment variables (see `src/config/env.ts`).:

```bash
invenio users create user@demo.org --password 123456 --active --confirm

invenio roles create admin
invenio access allow administration-access role admin
invenio users create admin@demo.org --password 123456 --active --confirm
invenio roles add admin@demo.org admin
invenio access allow superuser-access user admin@demo.org
```

### Running the API Tests

1. Generate authenticated storage states for all tested users once by running (or let it be automatically generated when you run `npx playwright test`):

    ```bash
    npx playwright test tests/api/auth.setup.ts
    ```

    The user state is saved in `tests/playwright/.auth/user.json` and admin state in `tests/playwright/.auth/admin.json` by default. Override the destination by setting the `AUTH_USER_FILE_PATH` and `AUTH_ADMIN_FILE_PATH` environment variables (see `src/config/env.ts` for details).

    NOTE: You need to first create the test user and admin in your InvenioRDM instance.

2. Execute the API suite:

    ```bash
    npx playwright test tests/api/invenio-api.spec.ts
    ```

    Requests target various endpoints like `/api/records` unless you provide a different base URL. See the JSDoc in `src/tests/api` for additional customization options.

## Development

This package contains linter configuration and scripts to build and test the code.
Please run:

```bash
pnpm install

npm run lint
npm run lint:fix

npm run prettier
npm run prettier:fix
```
