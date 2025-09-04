import { expect, Page } from '@playwright/test';
import { Locators } from '../locators';
import { Config } from '../config';
import { AllPages, BasePage, DepositPage } from '../pages';

export interface DepositionStep<P extends DepositPage> {
    apply: (page: P) => Promise<void>;
}

export class FillData<P extends DepositPage> implements DepositionStep<P> {
    data: { [methodName: string]: any };

    constructor(data: { [methodName: string]: any }) {
        this.data = data;
    }

    async apply(page: P): Promise<void> {
        for (const [methodName, value] of Object.entries(this.data)) {
            if (typeof (page as any)[methodName] === 'function') {
                await (page as any)[methodName](value);
            } else {
                throw new Error(`Method ${methodName} not found on ${DepositPage}`);
            }
        }
    }
}

export class Save<P extends DepositPage> implements DepositionStep<P> {
    async apply(page: P): Promise<void> {
        await page.clickSave();
    }
}

export interface DepositionData {
    data: { [methodName: string]: any }[];
    expectedErrors: string[];
}

export interface DepositionServiceInterface<D extends DepositPage> {
    /**
     * Fill the deposition form by following the provided steps.
     * @param page      the deposition page instance
     * @param steps     the steps to follow
     */
    fillDepositionForm: (page: DepositPage, steps: DepositionStep<D>[]) => Promise<void>;
}

export class DepositionService<L extends Locators, D extends DepositPage> implements DepositionServiceInterface<D> {
    /**
     * Implementation of the deposition service that invokes deposition & checking steps.
     */
    constructor(
        protected config: Config,
        protected page: DepositPage<L>,
        protected availablePages: AllPages<L>,
    ) { }

    async fillDepositionForm(page: D, steps: DepositionStep<D>[]): Promise<void> {
        for (const step of steps) {
            await step.apply(page);
        }
    }
}