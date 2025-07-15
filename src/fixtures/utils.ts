import { Page } from '@playwright/test';
import type { Locators } from '../locators';
import { BasePage } from '../pages';

export type PageFixtureParams<L extends Locators> = {
    page: Page;
    locators: L;
    availablePages: { [key: string]: object };
}

export type UseFunction<L extends Locators, T extends typeof BasePage<L>> = (r: InstanceType<T>) => Promise<void>;

const AsyncFunction = (async function () { }).constructor;

let __extra_fixtures_counter = 0;

export function registerPage<L extends Locators, T extends typeof BasePage<L>>(
    name: string,
    PageType: T,
    { extraFixtures }: { extraFixtures: string[] } = { extraFixtures: [] }
): { [key: string]: (params: PageFixtureParams<L>, use: UseFunction<L, T>) => Promise<void> } {
    const getter = async (fixtures, use) => {
        const pageInstance = new PageType(fixtures);
        fixtures.availablePages[name] = pageInstance;
        await use(pageInstance as InstanceType<T>);
    };

    if (extraFixtures.length > 0) {
        // playwright needs to know about the extra fixtures. How it knows about them:
        // 1. it takes the function passed to the test.extend method
        // 2. it serializes the function to javascript code 
        // 3. it parses the code to find fixture names
        // See innerFixtureParameterNames at 
        // https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/fixtures.ts
        //
        // To ensure that the extra fixtures are recognized, we need to generate a function that uses them.
        // and pass this one instead of the normal one below. We use the Function constructor
        // that does not have access to the local scope, so we need to pass the getter
        // function as a global variable. 

        const registrationFunctionName = `__registerPage_${name}_${__extra_fixtures_counter++}`;
        global[registrationFunctionName] = getter

        const parameters = [
            "page",
            "locators",
            "availablePages",
            ...extraFixtures, // extra fixtures are passed as parameters
        ].join(", ");
        return {
            [name]: AsyncFunction(
                `{${parameters}}`, "use",
                `return await global.${registrationFunctionName}({ page, locators, availablePages }, use);`)
        }
    }

    return {
        [name]: async ({ page, locators, availablePages }: PageFixtureParams<L>, use: UseFunction<L, T>) => {
            await getter({ page, locators, availablePages }, use)
        }
    }
}
