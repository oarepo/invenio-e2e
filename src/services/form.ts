import { Locators } from "../locators";
import { Config } from "../config";
import { BasePage, DepositPage } from "../pages";
import { FormData } from "../fixtures/depositionData";

export interface ExpectedError {
    message: string | RegExp;
    field?: string; // Optional field name associated with the error
}

export interface FormServiceInterface<L extends Locators = Locators> {
    /**
     * Fill the deposition form using FormData structure.
     * @param page      the deposition page instance
     * @param formData  the form data containing data, files, and expected errors
     */
    fillForm: (
        page: BasePage,
        formData: FormData
    ) => Promise<{ page: BasePage; filledData: any[][] }>;

    /**
     * Fill form fields with the provided data.
     * It will call `fill<FieldName>` method for each provided field on the DepositPage instance.
     */
    fill: (page: BasePage, data: Array<[string, any]>) => Promise<{ page: BasePage; filledData: any[] }>;

    /**
     * Save the form and return the resulting page.
     * To verify expected error messages, use the `expectErrors` method after this one.
     */
    save: (page: BasePage) => Promise<BasePage>;

    /**
     * Verify error messages on the form.
     * The expectedErrors array contains strings or regex patterns to match against 
     * error messages. If string is used, the whole error message must match this string.
     *
     * The onlyTheseErrors flag indicates whether to check for only the expected errors
     * or allow others. The default is strict checking (onlyTheseErrors = true), that is,
     * the caller must provide all expected errors or the check will fail.
     */
    expectErrors: (page: BasePage, expectedErrors: ExpectedError[], onlyTheseErrors?: boolean) => Promise<void | BasePage>;

    /**
     * Upload files to the form.
     * Upload a specific file from UploadFiles folder.
     */
    uploadFiles: (page: BasePage, fileNames: string[]) => Promise<{ page: BasePage; filledData: any[] }>;
}

export class FormService<L extends Locators>
    implements FormServiceInterface<L> {

    private fillMethodPrefixes = ["fill", "select", "add"];
    
    /**
     * Implementation of the deposition service that invokes deposition & checking steps.
     */
    constructor(protected config: Config) { }

    async fillForm(
        page: BasePage,
        formData: FormData
    ): Promise<{ page: BasePage; filledData: any[][] }> {
        const filledData: any[][] = [];

        // Fill form data
        const fillResult = await this.fill(page, formData.data);
        page = fillResult.page;
        if (fillResult.filledData.length > 0) {
            filledData.push(fillResult.filledData);
        }

        // Upload files if any
        if (formData.files.length > 0) {
            const uploadResult = await this.uploadFiles(page, formData.files);
            page = uploadResult.page;
            if (uploadResult.filledData.length > 0) {
                filledData.push(uploadResult.filledData);
            }
        }

        // Save the form
        page = await this.save(page);

        // Check for expected errors
        page = await this.expectErrors(page, formData.errors) || page;

        return { page, filledData };
    }

    async fill(page: BasePage, data: Array<[string, any]>): Promise<{ page: BasePage; filledData: any[] }> {
        const _p: any = page; // cast to any to allow dynamic method calls
        
        for (const [key, value] of data) {
            const method = this.getMethod(_p, key, this.fillMethodPrefixes);
            await _p[method](value);
        }

        // Transform data for return
        const filledData = data.map(([field, value]) => {
            if (field === "creator") {
                if (Array.isArray(value)) {
                    return [
                        field,
                        value.map((v) => `${v.familyName}, ${v.givenName}`).join(" ; "),
                    ];
                }
                return [field, `${value.familyName}, ${value.givenName}`];
            }

            if (Array.isArray(value)) {
                return [field, value.join(" ; ")];
            }

            if (typeof value === "object" && value !== null && "name" in value) {
                return [field, value.name];
            }

            return [field, value];
        });

        return { page, filledData };
    }

    async save(page: BasePage): Promise<BasePage> {
        const _p = page as any;
        const newPage = await _p.clickSave() || _p;
        return newPage;
    }

    async expectErrors(page: BasePage, expectedErrors: ExpectedError[], onlyTheseErrors: boolean = true): Promise<void | BasePage> {
        const _p = page as any;
        if (_p.verifyErrorMessages === undefined) {
            if (expectedErrors.length > 0) {
                throw new Error("The page does not implement verifyErrorMessages method");
            }
            return;
        }
        await _p.verifyErrorMessages(expectedErrors, onlyTheseErrors);
        return page;
    }

    async uploadFiles(page: BasePage, fileNames: string[]): Promise<{ page: BasePage; filledData: any[] }> {
        const filledData: any[] = [];
        
        for (const fileName of fileNames) {
            await (page as DepositPage).uploadFileAndConfirm(fileName);
            filledData.push(["uploadedFile", fileName]);
        }

        return { page, filledData };
    }

    /**
     * Helper method to find the appropriate method name for a field.
     */
    private getMethod(page: any, field: string, methodPrefixes: string[]): string {
        const triedMethods = [];
        for (const prefix of methodPrefixes) {
            const methodName = `${prefix}${field.charAt(0).toUpperCase() + field.slice(1)}`;
            triedMethods.push(methodName);
            if (typeof page[methodName] === "function") {
                return methodName;
            }
        }
        throw new Error(
            `No method found for filling field ${field}. Tried: ${triedMethods.join(", ")}`
        );
    }
}
