import { useEffect, useState } from 'react';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { LoadState } from '../../../shared/lib/load-state';
import { fetchAllTransactions } from '../../../shared/lib/transactions';

type UseAccountTransactionsResult = {
    readonly transactions: readonly Transaction[];
    readonly loadState: LoadState;
    readonly reload: () => Promise<void>;
};

/**
 * Loads all transactions for one account (full cursor walk).
 * Resets when `accountId` is null.
 */
export function useAccountTransactions(
    accountId: Account['id'] | null,
): UseAccountTransactionsResult {
    const [transactions, setTransactions] = useState<readonly Transaction[]>([]);
    const [loadState, setLoadState] = useState<LoadState>('idle');

    const reload = async () => {
        if (!accountId) {
            setTransactions([]);
            setLoadState('idle');
            return;
        }

        setLoadState('loading');

        try {
            const items = await fetchAllTransactions({ accountId });
            setTransactions(items);
            setLoadState('ready');
        } catch {
            setTransactions([]);
            setLoadState('error');
        }
    };

    useEffect(() => {
        void reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when account changes
    }, [accountId]);

    return { transactions, loadState, reload };
}
