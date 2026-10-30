import { useEffect, useMemo, useState } from 'react';
import { Account } from '@balance/dto/accounts';
import { useAccounts } from '../../../../entities/account';
import { LoadState } from '../../../../shared/lib/load-state';
import { usePreferences } from '../../../../shared/preferences';
import { sortAccountsByPreference } from './sort-accounts-by-preference';

export type UseAccountsSectionArgs = {
    readonly selectedAccountId: Account['id'] | null;
    readonly onSelectAccountId: (accountId: Account['id'] | null) => void;
};

export type UseAccountsSectionResult = {
    readonly orderedAccounts: readonly Account[];
    readonly loadState: LoadState;
    readonly loadError: string | null;
    readonly showSkeleton: boolean;
    readonly formOpen: boolean;
    readonly reorderOpen: boolean;
    readonly editing: Account | null;
    readonly deleting: Account | null;
    readonly reload: () => Promise<void>;
    readonly openCreate: () => void;
    readonly openEdit: (account: Account) => void;
    readonly openReorder: () => void;
    readonly closeForm: () => void;
    readonly closeReorder: () => void;
    readonly closeDelete: () => void;
    readonly openDelete: (account: Account) => void;
    readonly applySaved: (saved: Account) => void;
    readonly applyDeleted: (deleted: Account) => void;
    readonly saveReorder: (orderedIds: readonly Account['id'][]) => Promise<void>;
};

/**
 * Accounts strip UI state: preference order, selection sync, modals.
 * List data comes from {@link useAccounts}.
 */
export function useAccountsSection({
    selectedAccountId,
    onSelectAccountId,
}: UseAccountsSectionArgs): UseAccountsSectionResult {
    const { accounts, loadState, loadError, reloadAccounts, upsertAccount, removeAccount } = useAccounts();
    const { accountOrder, setAccountOrder } = usePreferences();

    const [isReordering, setIsReordering] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [reorderOpen, setReorderOpen] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);
    const [deleting, setDeleting] = useState<Account | null>(null);

    const orderedAccounts = useMemo(() => sortAccountsByPreference(accounts, accountOrder), [accounts, accountOrder]);
    const showSkeleton = loadState === 'loading' || isReordering;

    useEffect(() => {
        if (loadState !== 'ready') {
            return;
        }

        if (orderedAccounts.length === 0) {
            if (selectedAccountId !== null) {
                onSelectAccountId(null);
            }
            return;
        }

        const stillSelected = orderedAccounts.some((account) => account.id === selectedAccountId);

        if (!stillSelected) {
            onSelectAccountId(orderedAccounts[0]?.id ?? null);
        }
    }, [loadState, orderedAccounts, onSelectAccountId, selectedAccountId]);

    const applySaved = (saved: Account) => {
        upsertAccount(saved);
        onSelectAccountId(saved.id);
    };

    const applyDeleted = (deleted: Account) => {
        removeAccount(deleted.id);
    };

    const saveReorder = async (orderedIds: readonly Account['id'][]) => {
        setIsReordering(true);

        try {
            await setAccountOrder(orderedIds);
        } finally {
            setIsReordering(false);
        }
    };

    return {
        orderedAccounts,
        loadState: loadState,
        loadError: loadError,
        showSkeleton,
        formOpen,
        reorderOpen,
        editing,
        deleting,
        reload: reloadAccounts,
        openCreate: () => {
            setEditing(null);
            setFormOpen(true);
        },
        openEdit: (account) => {
            setEditing(account);
            setFormOpen(true);
        },
        openReorder: () => setReorderOpen(true),
        closeForm: () => {
            setFormOpen(false);
            setEditing(null);
        },
        closeReorder: () => setReorderOpen(false),
        closeDelete: () => setDeleting(null),
        openDelete: setDeleting,
        applySaved,
        applyDeleted,
        saveReorder,
    };
}
