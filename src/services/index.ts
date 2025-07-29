import { I18nServiceInterface, } from './i18n';
import { Locators } from '../locators';
import { LoginServiceInterface } from './login';
export { I18nService, I18nServiceInterface, I18nExpected, Translations } from './i18n';
export { LocalLoginService, LoginServiceInterface } from './login';

export interface Services<L extends Locators> {
    i18n: I18nServiceInterface<L>;
    login: LoginServiceInterface<L>;
}