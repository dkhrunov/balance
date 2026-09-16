import { CurrencyCode } from './currency-code';

/** Monetary value carried across the API boundary as a decimal-safe string. */
export interface Money {
    readonly amount: string;
    readonly currency: CurrencyCode;
}
