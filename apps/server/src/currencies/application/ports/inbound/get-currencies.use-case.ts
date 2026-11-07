import { CurrenciesResponse } from '@balance/dto/currencies';

/** Reads the currencies for an authenticated user. */
export interface IGetCurrenciesUseCase {
    /** Returns currency rows ordered by `key`, with the content hash of those rows. */
    execute(): Promise<CurrenciesResponse>;
}

export const GET_CURRENCIES_USE_CASE = Symbol('GET_CURRENCIES_USE_CASE');
