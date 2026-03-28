# E2E Testing Framework for Invenio

**Note:** This is a suggestion only; it might be changed or abandoned at any time.

## Dependencies

- [Node.js](https://nodejs.org/en/) (v20.11.0 or higher)
- [pnpm](https://pnpm.io/) (v9.0.0 or higher)

## How to Try It Out

> [!NOTE]
> **Latest update:** tested against [invenio-dev-latest master branch](https://github.com/Samk13/invenio-dev-latest) at commit [#005a90c1346ce8acad78277f7811d09940ce9b29](https://github.com/Samk13/invenio-dev-latest/commit/005a90c1346ce8acad78277f7811d09940ce9b29)

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

Setup a test user and admin (and possibly other users) in your InvenioRDM instance with the credentials matching those in your environment variables (see `src/config/env.ts`).:

```bash
source .venv/bin/activate

invenio users create user@demo.org --password 123456 --active --confirm

invenio roles create admin
invenio access allow administration-access role admin
invenio users create admin@demo.org --password 123456 --active --confirm
invenio roles add admin@demo.org admin
invenio access allow superuser-access user admin@demo.org

export INVENIO_USER_EMAIL=user@demo.org
export INVENIO_USER_PASSWORD=123456
```


6. Add this to your `invenio.cfg` to enable tests for the FETCH transport:

```python
# invenio.cfg

RECORDS_RESOURCES_FILES_ALLOWED_DOMAINS = [
    "inveniordm.docs.cern.ch",
]
```

7. Initialize translations

```bash

source .venv/bin/activate
cd e2e
npm run build-translations -- -l en
npm run build-translations -- -l de
npm run build-translations -- -l cs
```

7. Run your server in another terminal:

    ```bash
    cd <my-repository>
    invenio-cli run
    ```

8. Run tests:

    ```bash
    cd <my-repository>/e2e
    npx playwright test
    ```

Tests can be filtered with the following tags:

* `@api` - run API tests
* `@smoke` - run smoke tests

Example:

```bash
    npx playwright test --grep "@api|@smoke"
```

## What is tested

### API

### UI

### Translations

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
