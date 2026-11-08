import { CurrencyItem } from '@balance/dto/currencies';

export type CurrenciesCache = {
    readonly version: string;
    readonly items: readonly CurrencyItem[];
};

/** Browser cache of currencies. */
export const CURRENCIES_STORAGE_KEY = 'balance.currencies';

/**
 * Returns a cache value when `version` and `items` have the expected shape.
 * An empty list, a missing version, or a malformed row means the cache is absent.
 */
export function parseCurrenciesCache(value: unknown): CurrenciesCache | null {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const record = value as { version?: unknown; items?: unknown };

    if (typeof record.version !== 'string' || record.version.length === 0) {
        return null;
    }

    if (!Array.isArray(record.items) || record.items.length === 0) {
        return null;
    }

    const items: CurrencyItem[] = [];

    for (const entry of record.items) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }

        const row = entry as { key?: unknown; symbol?: unknown };

        if (
            typeof row.key !== 'string' ||
            row.key.length === 0 ||
            typeof row.symbol !== 'string' ||
            row.symbol.length === 0
        ) {
            return null;
        }

        items.push({ key: row.key, symbol: row.symbol });
    }

    return { version: record.version, items };
}

/** Reads the currencies cache. Storage failures and broken JSON count as a missing cache. */
export function readCurrencies(): CurrenciesCache | null {
    try {
        const raw = localStorage.getItem(CURRENCIES_STORAGE_KEY);

        if (!raw) {
            return null;
        }

        return parseCurrenciesCache(JSON.parse(raw));
    } catch {
        return null;
    }
}

/** Persists the currencies cache. Storage failures leave the caller's in-memory copy unchanged. */
export function persistCurrencies(cache: CurrenciesCache): void {
    try {
        localStorage.setItem(
            CURRENCIES_STORAGE_KEY,
            JSON.stringify({ version: cache.version, items: cache.items }),
        );
    } catch {
        // Private mode or blocked storage: the caller still holds the fetched currencies.
    }
}
