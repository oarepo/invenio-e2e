import { expect, Page } from '@playwright/test';
import { Locators } from '../locators';
import { Config } from '../config';
import { BasePage } from '../pages';


/**
 * Interface representing a single step in the deposition process.
 * Each step can be applied to a DepositPage instance.
 */
export interface FormStep {
    apply: (page: BasePage) => Promise<void | BasePage>;
    getFilledData: () => any[]; // returns the data filled in this step, for verification purposes
}

/**
 * Class representing a step to fill data into the deposition form.
 * It will call `fill<FieldName>` method for each provided field on the DepositPage instance.
 * 
 * Fill(["title", "My Title"], ...)
 */
export class Fill implements FormStep {
    data: Array<[string, any]>;
    methodPrefixes = ['fill', 'select', 'add'];

    constructor(...data: Array<[string, any]>) {
        this.data = data;
    }

    async apply(page: BasePage): Promise<void | BasePage> {
        const _p: any = page; // cast to any to allow dynamic method calls
        for (const [key, value] of this.data) {
            const method = this.getMethod(_p, key);
            await _p[method](value);
        }
    }

    getMethod(page: any, field: string): string {
        const triedMethods = [];
        for (const prefix of this.methodPrefixes) {
            const methodName = `${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}`;
            triedMethods.push(methodName);
            if (typeof page[methodName] === 'function') {
                return methodName;
            }
        }
        throw new Error(`No method found for filling field ${field}. Tried: ${triedMethods.join(', ')}`);
    }

    getFilledData(): any[] {
        return this.data;
    }
}

export interface ExpectedError {
    message: string | RegExp;
    field?: string; // Optional field name associated with the error
}

/**
 * Class representing a step to save the form. To verify expected error messages,
 * use the `ExpectErrors` step after this one.
 */
export class Save implements FormStep {
    async apply(page: BasePage): Promise<void | BasePage> {
        // dynamically call clickSave and verifyErrorMessages on the page instance.        // will fail if these methods do not exist
        const _p = page as any;
        const newPage = await _p.clickSave() || _p;
        return newPage;
    }
}

/**
 * Class representing a step that checks the form and verifies expected error messages.
 * The expectedErrors array contains strings or regex patterns to match against 
 * error messages. If string is used, the whole error message must match this string.
 * 
 * The onlyTheseErrors flag indicates whether to check for only the expected errors 
 * or allow others. The default is strict checking (onlyTheseErrors = true), that is, 
 * the caller must provide all expected errors or the check will fail.
 */
export class ExpectErrors implements FormStep {
    expectedErrors: ExpectedError[];
    onlyTheseErrors: boolean;

    constructor(expectedErrors: ExpectedError[] = [], onlyTheseErrors: boolean = true) {
        this.expectedErrors = expectedErrors;
        this.onlyTheseErrors = onlyTheseErrors;
    }
    async apply(page: BasePage): Promise<void | BasePage> {
        // dynamically call clickSave and verifyErrorMessages on the page instance.        // will fail if these methods do not exist
        const _p = page as any;
        if (_p.verifyErrorMessages === undefined) {
            if (this.expectedErrors.length > 0) {
                throw new Error("The page does not implement verifyErrorMessages method");
            }
            return page;
        }
        await _p.verifyErrorMessages(this.expectedErrors, this.onlyTheseErrors);
        return page;
    }

    getFilledData(): any[] {
        return [];
    }
}

export class UploadFile implements FormStep {
}

export interface FormServiceInterface<L extends Locators = Locators> {
    /**
     * Fill the deposition form by following the provided steps.
     * @param page      the deposition page instance
     * @param steps     the steps to follow
     */
    fillForm: (page: BasePage, steps: FormStep[]) => Promise<{ page: BasePage, filledData: any[][] }>;
}

export class FormService<L extends Locators> implements FormServiceInterface<L> {
    /**
     * Implementation of the deposition service that invokes deposition & checking steps.
     */
    constructor(
        protected config: Config,
    ) { }

    async fillForm(page: BasePage, steps: FormStep[]): Promise<{ page: BasePage, filledData: any[][] }> {
        const filledData = []
        for (const step of steps) {
            page = await step.apply(page) || page;
            filledData.push(step.getFilledData());
        }
        return { page, filledData };
    }
}