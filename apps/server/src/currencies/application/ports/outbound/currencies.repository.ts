import { CurrencyItem } from '@balance/dto/currencies';

/** Reads currency rows. There is no write port. */
export interface ICurrenciesRepository {
    /** Active currency rows ordered by `key`. */
    findAll(): Promise<readonly CurrencyItem[]>;
}

export const CURRENCIES_REPOSITORY = Symbol('CURRENCIES_REPOSITORY');
