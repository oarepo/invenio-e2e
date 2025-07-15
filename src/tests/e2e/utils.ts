import { test as playwrightTest } from "@playwright/test"

export function test_if_not_skipped<T extends typeof playwrightTest>(
    test: T,
    suiteName: string,
    skipped: string[] | undefined,
): undefined | ((name: string, fn: (args: any) => Promise<void>) => void) {
    if (skipped && skipped.includes(suiteName)) {
        return undefined;
    }
    return (name, fn) => {
        if (skipped && skipped.includes(`${suiteName}/${name}`)) {
            return test.skip(name, fn);
        }
        return test(name, fn);
    };
}