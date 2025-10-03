import { locators } from './defaultLocators';
import { merge } from 'ts-deepmerge';

export { locators } from './defaultLocators';

/**
 * Type definition for the locators object.
 */
export type Locators = typeof locators;

type UseLocators<L> = (r: L & Locators) => Promise<void>;

/**
 * 
 * Function to update locators if user wants to override the default locators inside fixtures. 
 * 
 * 
 * ```typescript
 *    import { updateLocators } from '@inveniosoftware/invenio-e2e';
 * 
 *    myLocators = { ... }
 * 
 *    export const test = invenio_test.extend({
 *      locators: updateLocators(myLocators),
 *    })
 * ```
 * 
 * If you extend the locators with new properties and you need to use them in your page classes, define a new type that extends the Locators type:
 * 
 * ```typescript
 * 
 *    import { Locators } from '@inveniosoftware/invenio-e2e';
 *    import {myLocators} from './myLocators';
 * 
 *    export type MyLocators = Locators & typeof myLocators;
 * 
 * ```
 * 
 * Then, create your page class with the new type:
 * 
 * ```typescript
 * 
 *    import { BasePage } from '@inveniosoftware/invenio-e2e';
 *    class MyPage extends BasePage<MyLocators> {
 *        blah() {
 *          console.log(this.locators.myPage.something);
 *        }
 *    }
 * ```
 *
 * @param locators the new locators to be merged with the existing ones.
 * @returns A function that takes the original locators and 
 *          merges them with the new ones, to be used in the test 
 *          fixture definition.
 */
export function updateLocators<T extends Record<string, unknown>>(locators: T): (
    (params: { locators: Locators }, use: UseLocators<T & Locators>) => Promise<void>) {
    return async ({ locators: origLocators }, use) => {
        // NOTE: https://github.com/voodoocreation/ts-deepmerge/issues/30: When working with generic declared types/interfaces
        // TODO: Create a type-safe interfaces like ILocatorsObject
        await use(merge(origLocators, locators as object) as T & Locators);
    };
}
