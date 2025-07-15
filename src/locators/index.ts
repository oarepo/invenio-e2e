import { merge } from 'ts-deepmerge';
import { locators } from './defaultLocators';

export { locators } from './defaultLocators';

/**
 * Type definition for the locators object.
 */
export type Locators = typeof locators;

type UseLocators<L> = (r: L & Locators) => Promise<void>;

/**
 * 
 * Function to update locators if user wants to override the default locators inside
 * fixtures.
 * 
 * @param locators the new locators to be merged with the existing ones.
 * @returns A function that takes the original locators and merges them with the new ones.
 * 
 * Sample usage:
 * 
 * ```typescript
 * import { updateLocators } from '@inveniosoftware/invenio-e2e';
 * 
 * myLocators = { ... }
 * 
 * export const test = invenio_test.extend({
 *   locators: updateLocators(myLocators),
 * ```
 */
export function updateLocators<T>(locators: T): (
    (params: { locators: Locators }, use: UseLocators<T & Locators>) => Promise<void>) {
    return async ({ locators: origLocators }, use) => {
        await use(merge(origLocators, locators) as T & Locators);
    };
}
