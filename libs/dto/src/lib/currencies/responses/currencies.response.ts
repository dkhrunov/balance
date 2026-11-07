import { CurrencyItem } from '../models/currency-item';

/** Currencies plus the hash of that exact content. */
export interface CurrenciesResponse {
    readonly version: string;
    readonly items: readonly CurrencyItem[];
}
