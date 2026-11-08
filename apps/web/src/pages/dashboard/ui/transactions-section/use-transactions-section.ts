import { useMemo, useState } from 'react';
import { Account } from '@balance/dto/accounts';
import { Category } from '@balance/dto/categories';
import { IncomeExpenseType, Transaction } from '@balance/dto/transactions';
import { AccountBalance } from '@balance/domain/transactions';
import { useTranslation } from 'react-i18next';
import { useAccounts } from '../../../../entities/account';
import { useCategories } from '../../../../entities/category';
import { useCurrencies } from '../../../../entities/currency';
import { useAuth } from '../../../../shared/auth';
import { formatMoney } from '../../../../shared/lib/money';
import { LoadState } from '../../../../shared/lib/load-state';
import { usePreferences } from '../../../../shared/preferences';
import { TransactionCreateIntent } from './transaction-create-intent';
import { FilterItem, TypeFilter } from './transaction-filters';
import {
    TRANSACTION_TABLE_HEADER_KEYS,
    TransactionTableRow,
} from './transactions-data-table/transaction-table-row';

type ActiveForm =
    | {
          readonly kind: 'transaction';
          readonly type: IncomeExpenseType;
          readonly transaction: Transaction | null;
      }
    | {
          readonly kind: 'transfer';
          readonly transaction: Transaction | null;
      };

export type UseTransactionsSectionArgs = {
    readonly account: Account | null;
    readonly transactions: readonly Transaction[];
    readonly transactionsLoadState: LoadState;
};

export type UseTransactionsSectionResult = {
    readonly incomeCategories: readonly Category[];
    readonly expenseCategories: readonly Category[];
    readonly categoriesMap: ReadonlyMap<Category['id'], Category>;
    readonly transactionsMap: ReadonlyMap<Transaction['id'], Transaction>;
    readonly typeFilter: TypeFilter;
    readonly typeItems: FilterItem<TypeFilter>[];
    readonly headers: { readonly key: string; readonly header: string }[];
    readonly rows: TransactionTableRow[];
    readonly showSkeleton: boolean;
    readonly activeForm: ActiveForm | null;
    readonly deleting: Transaction | null;
    readonly setTypeFilter: (filter: TypeFilter) => void;
    readonly openCreate: (intent: TransactionCreateIntent) => void;
    readonly openEdit: (transaction: Transaction) => void;
    readonly closeForm: () => void;
    readonly openDelete: (transaction: Transaction) => void;
    readonly closeDelete: () => void;
};

/**
 * Transactions section state: filters, table rows, and form/delete modals.
 * Accounts/categories catalogs come from entity providers.
 */
export function useTransactionsSection({
    account,
    transactions,
    transactionsLoadState,
}: UseTransactionsSectionArgs): UseTransactionsSectionResult {
    const { t } = useTranslation();
    const { locale } = usePreferences();
    const currencies = useCurrencies();
    const { user } = useAuth();
    const { loadState: accountsLoadState } = useAccounts();
    const { income, expense, categoriesMap } = useCategories();
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
    const [deleting, setDeleting] = useState<Transaction | null>(null);

    const showSkeleton =
        accountsLoadState === 'loading' ||
        transactionsLoadState === 'loading' ||
        (transactionsLoadState === 'idle' && !account);

    const transactionsMap = useMemo(() => {
        const map = new Map<Transaction['id'], Transaction>();

        for (const transaction of transactions) {
            map.set(transaction.id, transaction);
        }

        return map;
    }, [transactions]);

    const typeItems: FilterItem<TypeFilter>[] = [
        { id: 'all', label: t('transactions.filters.typeAll') },
        { id: 'INCOME', label: t('transactions.types.INCOME') },
        { id: 'EXPENSE', label: t('transactions.types.EXPENSE') },
        { id: 'TRANSFER_IN', label: t('transactions.types.TRANSFER_IN') },
        { id: 'TRANSFER_OUT', label: t('transactions.types.TRANSFER_OUT') },
    ];

    const headers = useMemo(
        () =>
            TRANSACTION_TABLE_HEADER_KEYS.map((key) => ({
                key,
                header: t(`transactions.columns.${key}`),
            })),
        [t],
    );

    const rows = useMemo((): TransactionTableRow[] => {
        const filtered = transactions.filter(
            (transaction) => typeFilter === 'all' || transaction.type === typeFilter,
        );

        // Client-side type filter until BE query supports type + pagination.
        return filtered.map((transaction) => {
            const category = transaction.categoryId
                ? categoriesMap.get(transaction.categoryId)
                : null;
            const isTransfer =
                transaction.type === 'TRANSFER_IN' || transaction.type === 'TRANSFER_OUT';
            const isPositive = AccountBalance.isIncreasingType(transaction.type);
            const formatted = formatMoney(
                transaction.amount,
                transaction.currency,
                currencies.symbol(transaction.currency),
                locale,
            );
            const amountLabel = isTransfer || isPositive ? formatted : `−${formatted}`;
            const createdByLabel =
                user && transaction.createdBy === user.id
                    ? user.displayName || user.email
                    : t('transactions.otherUser');

            return {
                id: transaction.id,
                date: transaction.transactionDate,
                type: t(`transactions.types.${transaction.type}`),
                category: category?.name ?? (isTransfer ? t('transactions.transferCategory') : '—'),
                description: transaction.description || '—',
                amount: amountLabel,
                createdBy: createdByLabel,
                actions: '',
            };
        });
    }, [categoriesMap, currencies, locale, t, transactions, typeFilter, user]);

    const openCreate = (intent: TransactionCreateIntent) => {
        if (intent === 'TRANSFER') {
            setActiveForm({ kind: 'transfer', transaction: null });
            return;
        }

        setActiveForm({ kind: 'transaction', type: intent, transaction: null });
    };

    const openEdit = (transaction: Transaction) => {
        if (transaction.type === 'TRANSFER_IN' || transaction.type === 'TRANSFER_OUT') {
            setActiveForm({ kind: 'transfer', transaction });
            return;
        }

        setActiveForm({
            kind: 'transaction',
            type: transaction.type,
            transaction,
        });
    };

    return {
        incomeCategories: income,
        expenseCategories: expense,
        categoriesMap,
        transactionsMap,
        typeFilter,
        typeItems,
        headers,
        rows,
        showSkeleton,
        activeForm,
        deleting,
        setTypeFilter,
        openCreate,
        openEdit,
        closeForm: () => setActiveForm(null),
        openDelete: setDeleting,
        closeDelete: () => setDeleting(null),
    };
}
