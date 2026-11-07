import { CurrenciesVersionResponse } from '@balance/dto/currencies';

/** Reads the content hash of the currencies. */
export interface IGetCurrenciesVersionUseCase {
    /** Returns the hash of canonical `key` and `symbol` rows. */
    execute(): Promise<CurrenciesVersionResponse>;
}

export const GET_CURRENCIES_VERSION_USE_CASE = Symbol('GET_CURRENCIES_VERSION_USE_CASE');
