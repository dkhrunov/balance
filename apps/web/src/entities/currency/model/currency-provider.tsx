import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CurrencyItem } from '@balance/dto/currencies';
import { CurrencyCode } from '@balance/domain/currency';
import { CurrenciesApi } from '../../../shared/api';
import { useAuth } from '../../../shared/auth';
import { LoadState } from '../../../shared/lib/load-state';
import { CURRENCIES_STORAGE_KEY, persistCurrencies, readCurrencies } from '../lib/currency';
import { syncCurrencies } from '../lib/sync-currencies';

/** Currencies for the signed-in session. */
export interface ICurrencies {
    /**
     * Currency items.
     */
    readonly items: readonly CurrencyItem[];
    /**
     * Load state.
     */
    readonly loadState: LoadState;
    /**
     * Display symbol for an ISO code.
     * Returns `key` when no currency row matches or the row has an empty symbol.
     */
    symbol: (key: CurrencyCode) => string;
}

const CurrenciesContext = createContext<ICurrencies | null>(null);

/**
 * Symbol stored for `key`, or `key` when no currency row supplies one.
 *
 * @param items Current currency rows.
 * @param key ISO 4217 code.
 */
function currencySymbol(items: readonly CurrencyItem[], key: CurrencyCode): string {
    for (const item of items) {
        if (item.key === key && item.symbol.length > 0) {
            return item.symbol;
        }
    }

    return key;
}

const EMPTY_ITEMS: readonly CurrencyItem[] = [];

/**
 * Shows cached currencies immediately, then revalidates them for an authenticated user.
 * A missing cache loads the full list. A failed check keeps the previous cache.
 */
export function CurrenciesProvider({ children }: { children: ReactNode }) {
    const { status: authStatus } = useAuth();
    const [items, setItems] = useState<readonly CurrencyItem[]>(
        () => readCurrencies()?.items ?? EMPTY_ITEMS,
    );
    const [fetchState, setFetchState] = useState<LoadState>('idle');

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== CURRENCIES_STORAGE_KEY) {
                return;
            }

            setItems(readCurrencies()?.items ?? EMPTY_ITEMS);
        };

        window.addEventListener('storage', onStorage);

        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => {
        if (authStatus !== 'authenticated') {
            setFetchState('idle');
            return;
        }

        let cancelled = false;
        const cached = readCurrencies();

        if (!cached) {
            setFetchState('loading');
        }

        syncCurrencies(cached, {
            getVersion: () => CurrenciesApi.getVersion(),
            getCurrencies: () => CurrenciesApi.getCurrencies(),
        }).then((result) => {
            if (cancelled) {
                return;
            }

            if (result.status === 'replaced') {
                persistCurrencies(result.currencies);
                setItems(result.currencies.items);
                setFetchState('ready');
                return;
            }

            if (result.status === 'empty') {
                setFetchState('error');
                return;
            }

            setFetchState('ready');
        });

        return () => {
            cancelled = true;
        };
    }, [authStatus]);

    const loadState: LoadState = items.length > 0 ? 'ready' : fetchState;

    const value = useMemo(
        (): ICurrencies => ({
            items,
            loadState,
            symbol: (key: CurrencyCode) => currencySymbol(items, key),
        }),
        [items, loadState],
    );

    return <CurrenciesContext.Provider value={value}>{children}</CurrenciesContext.Provider>;
}

/** Returns the shared currencies. Requires {@link CurrenciesProvider}. */
export function useCurrencies(): ICurrencies {
    const context = useContext(CurrenciesContext);

    if (!context) {
        throw new Error('useCurrencies must be used within CurrenciesProvider');
    }

    return context;
}
