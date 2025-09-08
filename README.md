# E2E Testing Framework for Invenio

**Note:** This is a suggestion only; it might be changed or abandoned at any time.

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
    gh repo clone mesemus/sample-e2e-repository temp-repository
    mv temp-repository/e2e <my-repository>/e2e
    rm -rf temp-repository
    ```

4. Install dependencies:

    ```bash
    cd <my-repository>/e2e
    pnpm install
    ```

5. Configure environment variables:

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
