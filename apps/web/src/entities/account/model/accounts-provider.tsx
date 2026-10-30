import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    ReactNode,
} from 'react';
import { Account } from '@balance/dto/accounts';
import { useTranslation } from 'react-i18next';
import { AccountsApi } from '../../../shared/api';
import { useAuth } from '../../../shared/auth';
import { LoadState } from '../../../shared/lib/load-state';

/**
 * Shared in-memory accounts catalog for the authenticated session.
 * Consumers read via {@link useAccounts}; mutations must call
 * {@link IAccounts.upsertAccount} / {@link IAccounts.removeAccount} after API success.
 */
export interface IAccounts {
    readonly accounts: readonly Account[];
    readonly accountsMap: ReadonlyMap<Account['id'], Account>;
    readonly loadState: LoadState;
    readonly loadError: string | null;
    reloadAccounts: () => Promise<void>;
    upsertAccount: (account: Account) => void;
    removeAccount: (accountId: Account['id']) => void;
}

const AccountsContext = createContext<IAccounts | null>(null);

const EMPTY: readonly Account[] = [];
const EMPTY_MAP: ReadonlyMap<Account['id'], Account> = new Map();

function buildAccountsMap(accounts: readonly Account[]): ReadonlyMap<Account['id'], Account> {
    const map = new Map<Account['id'], Account>();

    for (const account of accounts) {
        map.set(account.id, account);
    }

    return map;
}

/**
 * Loads and owns the space accounts list while the user is authenticated.
 */
export function AccountsProvider({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    const { status: authStatus } = useAuth();
    const [accounts, setAccounts] = useState<readonly Account[]>(EMPTY);
    const [loadState, setLoadState] = useState<LoadState>('idle');
    const [loadError, setLoadError] = useState<string | null>(null);
    // Keep `t` out of the fetch effect deps — locale apply after preferences would refetch.
    const tRef = useRef(t);
    tRef.current = t;

    useEffect(() => {
        if (authStatus !== 'authenticated') {
            setAccounts(EMPTY);
            setLoadState('idle');
            setLoadError(null);
            return;
        }

        let cancelled = false;

        setLoadState('loading');
        setLoadError(null);

        AccountsApi.queryAccounts()
            .then((response) => {
                if (!cancelled) {
                    setAccounts(response.items);
                    setLoadState('ready');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAccounts(EMPTY);
                    setLoadState('error');
                    setLoadError(tRef.current('accounts.loadError'));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [authStatus]);

    const reloadAccounts = useCallback(async () => {
        if (authStatus !== 'authenticated') {
            setAccounts(EMPTY);
            setLoadState('idle');
            setLoadError(null);
            return;
        }

        setLoadState('loading');
        setLoadError(null);

        try {
            const response = await AccountsApi.queryAccounts();
            setAccounts(response.items);
            setLoadState('ready');
        } catch {
            setAccounts(EMPTY);
            setLoadState('error');
            setLoadError(tRef.current('accounts.loadError'));
        }
    }, [authStatus]);

    const upsertAccount = useCallback((account: Account) => {
        setAccounts((current) => {
            const index = current.findIndex((item) => item.id === account.id);

            if (index === -1) {
                return [...current, account];
            }

            return current.map((item) => (item.id === account.id ? account : item));
        });
    }, []);

    const removeAccount = useCallback((accountId: Account['id']) => {
        setAccounts((current) => current.filter((account) => account.id !== accountId));
    }, []);

    const value = useMemo(
        (): IAccounts => ({
            accounts,
            accountsMap: accounts.length === 0 ? EMPTY_MAP : buildAccountsMap(accounts),
            loadState,
            loadError,
            reloadAccounts,
            upsertAccount,
            removeAccount,
        }),
        [accounts, loadState, loadError, reloadAccounts, upsertAccount, removeAccount],
    );

    return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

/** Returns the shared accounts catalog. Requires {@link AccountsProvider}. */
export function useAccounts(): IAccounts {
    const context = useContext(AccountsContext);

    if (!context) {
        throw new Error('useAccounts must be used within AccountsProvider');
    }

    return context;
}
