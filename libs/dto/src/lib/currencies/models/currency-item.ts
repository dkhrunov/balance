import { CurrencyCode } from './currency-code';

/**
 * One currency row returned to clients.
 * `key` is the ISO 4217 code stored on accounts, transactions, and default currency.
 */
export interface CurrencyItem {
    readonly key: CurrencyCode;
    readonly symbol: string;
}
