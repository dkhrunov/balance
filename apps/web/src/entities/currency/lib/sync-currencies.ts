import { CurrenciesResponse, CurrenciesVersionResponse } from '@balance/dto/currencies';
import { CurrenciesCache, parseCurrenciesCache } from './currency';

export interface ICurrenciesClient {
    getVersion: () => Promise<CurrenciesVersionResponse>;
    getCurrencies: () => Promise<CurrenciesResponse>;
}

export type CurrenciesSyncResult =
    | { readonly status: 'unchanged' }
    | { readonly status: 'replaced'; readonly currencies: CurrenciesCache }
    | { readonly status: 'empty' };

/**
 * Chooses whether to keep the cache, replace it, or stay empty.
 * A cached list is checked with `GET /currencies/version` only.
 * A missing cache loads `GET /currencies` and does not invent currency codes.
 */
export async function syncCurrencies(
    cache: CurrenciesCache | null,
    client: ICurrenciesClient,
): Promise<CurrenciesSyncResult> {
    if (!cache) {
        try {
            const loaded = parseCurrenciesCache(await client.getCurrencies());

            return loaded ? { status: 'replaced', currencies: loaded } : { status: 'empty' };
        } catch {
            return { status: 'empty' };
        }
    }

    try {
        const version = await client.getVersion();

        if (version.version === cache.version) {
            return { status: 'unchanged' };
        }
    } catch {
        return { status: 'unchanged' };
    }

    try {
        const loaded = parseCurrenciesCache(await client.getCurrencies());

        return loaded ? { status: 'replaced', currencies: loaded } : { status: 'unchanged' };
    } catch {
        return { status: 'unchanged' };
    }
}
