import { afterEach, describe, expect, it } from 'vitest';
import { syncCurrencies } from './sync-currencies';
import {
    CURRENCIES_STORAGE_KEY,
    parseCurrenciesCache,
    persistCurrencies,
    readCurrencies,
} from './currency';
import { currencyNameWithSymbol } from './currency-name';

const seeded = {
    version: 'hash-1',
    items: [
        { key: 'EUR', symbol: '€' },
        { key: 'RUB', symbol: '₽' },
        { key: 'USD', symbol: '$' },
    ],
};

afterEach(() => {
    localStorage.clear();
});

describe('parseCurrenciesCache', () => {
    it('rejects a missing version, an empty list, and a broken row', () => {
        expect(parseCurrenciesCache(null)).toBeNull();
        expect(parseCurrenciesCache({ version: 'v', items: [] })).toBeNull();
        expect(parseCurrenciesCache({ version: '', items: seeded.items })).toBeNull();
        expect(parseCurrenciesCache({ version: 'v', items: [{ key: 'USD' }] })).toBeNull();
        expect(parseCurrenciesCache('not-json')).toBeNull();
    });
});

describe('currencies storage', () => {
    it('reads a valid cache and treats broken JSON as missing', () => {
        persistCurrencies(seeded);

        expect(readCurrencies()).toEqual(seeded);
        expect(localStorage.getItem(CURRENCIES_STORAGE_KEY)).toContain('RUB');

        localStorage.setItem(CURRENCIES_STORAGE_KEY, '{');

        expect(readCurrencies()).toBeNull();
    });
});

describe('syncCurrencies', () => {
    it('does not load the list when the cached version matches', async () => {
        const getCurrencies = vi.fn();
        const result = await syncCurrencies(seeded, {
            getVersion: () => Promise.resolve({ version: 'hash-1' }),
            getCurrencies,
        });

        expect(result).toEqual({ status: 'unchanged' });
        expect(getCurrencies).not.toHaveBeenCalled();
    });

    it('replaces the cache when the version differs', async () => {
        const next = {
            version: 'hash-2',
            items: [
                { key: 'EUR', symbol: '€' },
                { key: 'RUB', symbol: 'руб.' },
                { key: 'USD', symbol: '$' },
            ],
        };
        const result = await syncCurrencies(seeded, {
            getVersion: () => Promise.resolve({ version: 'hash-2' }),
            getCurrencies: () => Promise.resolve(next),
        });

        expect(result).toEqual({ status: 'replaced', currencies: next });
    });

    it('keeps the cache when the version check fails', async () => {
        const getCurrencies = vi.fn();
        const result = await syncCurrencies(seeded, {
            getVersion: () => Promise.reject(new Error('401')),
            getCurrencies,
        });

        expect(result).toEqual({ status: 'unchanged' });
        expect(getCurrencies).not.toHaveBeenCalled();
    });

    it('loads the list without a version check when the cache is missing', async () => {
        const getVersion = vi.fn();
        const result = await syncCurrencies(null, {
            getVersion,
            getCurrencies: () => Promise.resolve(seeded),
        });

        expect(getVersion).not.toHaveBeenCalled();
        expect(result).toEqual({ status: 'replaced', currencies: seeded });
    });

    it('stays empty when the first load fails and does not invent codes', async () => {
        const result = await syncCurrencies(null, {
            getVersion: () => Promise.resolve({ version: 'unused' }),
            getCurrencies: () => Promise.reject(new Error('offline')),
        });

        expect(result).toEqual({ status: 'empty' });
        expect(JSON.stringify(result)).not.toContain('RUB');
        expect(JSON.stringify(result)).not.toContain('USD');
        expect(JSON.stringify(result)).not.toContain('EUR');
    });
});

describe('currencyNameWithSymbol', () => {
    it('renders the localized name and the currency symbol', () => {
        expect(currencyNameWithSymbol({ key: 'USD', symbol: '$' }, 'en')).toMatch(/dollar/i);
        expect(currencyNameWithSymbol({ key: 'USD', symbol: '$' }, 'en')).toContain('$');
        expect(currencyNameWithSymbol({ key: 'RUB', symbol: '₽' }, 'ru')).toContain('₽');
    });

    it('shows the key when the name or the symbol is missing', () => {
        expect(currencyNameWithSymbol({ key: 'XYZ', symbol: '¤' }, 'en')).toBe('XYZ');
        expect(currencyNameWithSymbol({ key: 'USD', symbol: ' ' }, 'en')).toBe('USD');
    });
});
