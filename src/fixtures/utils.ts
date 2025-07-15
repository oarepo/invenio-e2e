import { Page } from '@playwright/test';
import type { Locators } from '../locators';
import { BasePage } from '../pages';

/**
 * PageFixtureParams defines the parameters required to create a page instance.
 * User pages might extend this type to include additional parameters.
 */
export type PageFixtureParams<L extends Locators> = {
    page: Page;
    locators: L;
    availablePages: { [key: string]: object };
}

/**
 * UseFunction is a type that represents a function callback used in fixture definitions.
 */
export type UseFunction<L extends Locators, T extends typeof BasePage<L>> = (r: InstanceType<T>) => Promise<void>;

/**
 * FixtureRegistrationFunction is a type that represents a function used to register 
 * a page fixture.
 */
export type FixtureRegistrationFunction<L extends Locators, T extends typeof BasePage<L>> = (
    params: PageFixtureParams<L>,
    use: UseFunction<L, T>
) => Promise<void>;

/**
 * registerPage is a utility function to register a page in the test fixture.
 * Usage:
 * 
 * ```typescript
 * 
 *    import { registerPage } from '@inveniosoftware/invenio-e2e';
 *    export const test = invenio_test.extend({
 *       blah: 1, // this is just an example of an extra fixture
 *       ...registerPage('myPage', MyPage, { extraFixtures: ['blah'] }),
 *    });
 * 
 * ```
 * 
 * It is equivalent to:
 * 
 * ```typescript
 *   export const test = invenio_test.extend({
 *      blah: 1,
 *      myPage: async ({ page, locators, availablePages, blah }, use) => {
 *         const inst = new MyPage({ page, locators, availablePages, blah });
 *         availablePages.myPage = inst;
 *         await use(inst);
 *      }
 *   });
 * ```
 * 
 * @param name        The name of the fixture that will contain the page instance.
 * @param PageType    Page class to be registered.
 * @param options     Optional options for the registration, such as extraFixtures. 
 * @returns           An object with the fixture registration function for the page
 *                    to be used deconstructed in the test fixture.
 */
export function registerPage<L extends Locators, T extends typeof BasePage<L>>(
    name: string,
    PageType: T,
    options: { extraFixtures: string[] } = { extraFixtures: [] }
): { [key: string]: FixtureRegistrationFunction<L, T> } {

    const page_creator = async (fixtures: any, use: UseFunction<L, T>) => {
        const pageInstance = new PageType(fixtures);
        fixtures.availablePages[name] = pageInstance;
        await use(pageInstance as InstanceType<T>);
    };

    if (options.extraFixtures?.length > 0) {
        // playwright needs to know about the extra fixtures. How it knows about them:
        // 1. it takes the function passed to the test.extend method
        // 2. it serializes the function to javascript code 
        // 3. it parses the code to find fixture names
        // See innerFixtureParameterNames at 
        // https://github.com/microsoft/playwright/blob/main/packages/playwright/src/common/fixtures.ts
        //
        // To ensure that the extra fixtures are recognized, we need to generate a function 
        // that explicitly references them in object destructuring brackets and return this
        // function to playwright.

        const parameters = [
            "page",
            "locators",
            "availablePages",
            ...options.extraFixtures, // extra fixtures are passed as parameters
        ].join(", ");
        const func = eval(`async ({ ${parameters} } , use) => { return await page_creator({ ${parameters} }, use); }`);
        return {
            [name]: func
        }
    }

    return {
        [name]: async ({ page, locators, availablePages }: PageFixtureParams<L>, use: UseFunction<L, T>) => {
            await page_creator({ page, locators, availablePages }, use)
        }
    }
}
