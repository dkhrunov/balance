import { useRef } from 'react';
import { Button, InlineNotification } from '@carbon/react';
import { Add, ChevronSort } from '@carbon/react/icons';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AsciiReveal, AsciiRevealHandle } from 'ascii-reveal';
import { useTranslation } from 'react-i18next';
import { useSettledAsciiReveal } from '../../../../shared/lib/ascii-reveal';
import { EmptyState } from '../../../../shared/ui/empty-state';
import { AccountDeleteModal } from './account-delete-modal';
import { AccountFormModal } from './account-form-modal';
import { AccountReorderModal } from './account-reorder-modal';
import { AccountTiles } from './account-tiles';
import { AccountTilesSkeleton } from './account-tiles-skeleton';
import { useAccountsSection } from './use-accounts-section';
import styles from './accounts-section.module.scss';

type AccountsSectionProps = {
    /** Currently selected account id, or null when none. */
    readonly selectedAccountId: Account['id'] | null;
    /** Transactions for the selected account (used to derive that card’s balance). */
    readonly selectedAccountTransactions: readonly Transaction[];
    /** Notifies the dashboard when the user selects an account card. */
    readonly onSelectAccountId: (accountId: Account['id'] | null) => void;
};

/**
 * Dashboard accounts strip: carousel of accounts with create/edit/delete modals.
 * Catalog data comes from the accounts entity provider via {@link useAccountsSection}.
 */
export function AccountsSection({
    selectedAccountId,
    selectedAccountTransactions,
    onSelectAccountId,
}: AccountsSectionProps) {
    const { t } = useTranslation();
    const section = useAccountsSection({
        selectedAccountId,
        onSelectAccountId,
    });

    const revealRef = useRef<AsciiRevealHandle>(null);

    const showError = section.loadState === 'error';

    const showReady = section.loadState === 'ready';

    // Wait until RadioTile selection is synced — flipping selection mid-reveal
    // resizes the wrapper and ascii-reveal aborts the animation.
    const selectionSettled =
        section.orderedAccounts.length === 0 || selectedAccountId !== null;

    const revealEnabled =
        !section.showSkeleton && selectionSettled && (showReady || showError);

    useSettledAsciiReveal(revealRef, revealEnabled);

    return (
        <section className={styles.section} aria-labelledby="dashboard-accounts-heading">
            <div className={styles.header}>
                <h4 id="dashboard-accounts-heading" className={styles.title}>
                    {t('accounts.title')}
                </h4>
            </div>

            <AsciiReveal>
                <div className={styles.actions} data-ascii="fade">
                    <Button
                        kind="ghost"
                        renderIcon={ChevronSort}
                        disabled={section.showSkeleton || section.orderedAccounts.length < 2}
                        onClick={section.openReorder}
                    >
                        {t('accounts.actions.reorder')}
                    </Button>
                    <Button
                        kind="primary"
                        renderIcon={Add}
                        disabled={section.showSkeleton}
                        onClick={section.openCreate}
                    >
                        {t('accounts.actions.add')}
                    </Button>
                </div>
            </AsciiReveal>

            <AsciiReveal ref={revealRef} revealOnMount={false} fallback={false}>
                {showError ? (
                    <>
                        <InlineNotification
                            kind="error"
                            title={t('accounts.cannotLoad')}
                            subtitle={section.loadError ?? undefined}
                            lowContrast
                            hideCloseButton
                        />
                        <Button kind="ghost" size="sm" onClick={() => void section.reload()}>
                            {t('accounts.actions.retry')}
                        </Button>
                    </>
                ) : null}

                {showReady && section.orderedAccounts.length === 0 ? (
                    <EmptyState
                        illustrationKind="default"
                        title={t('accounts.emptyTitle')}
                        body={t('accounts.emptyBody')}
                        action={{
                            label: t('accounts.actions.add'),
                            kind: 'tertiary',
                            renderIcon: Add,
                            onClick: section.openCreate,
                        }}
                    />
                ) : null}

                {showReady && section.orderedAccounts.length > 0 ? (
                    <AccountTiles
                        accounts={section.orderedAccounts}
                        selectedAccountId={selectedAccountId}
                        selectedAccountTransactions={selectedAccountTransactions}
                        onSelectAccountId={onSelectAccountId}
                        onEdit={section.openEdit}
                        onDelete={section.openDelete}
                    />
                ) : null}

                {section.showSkeleton ? <AccountTilesSkeleton /> : null}
            </AsciiReveal>

            <AccountFormModal
                open={section.formOpen}
                account={section.editing}
                onClose={section.closeForm}
                onSaved={section.applySaved}
            />

            <AccountReorderModal
                open={section.reorderOpen}
                accounts={section.orderedAccounts}
                onClose={section.closeReorder}
                onSave={section.saveReorder}
            />

            <AccountDeleteModal
                open={section.deleting !== null}
                account={section.deleting}
                onClose={section.closeDelete}
                onDeleted={section.applyDeleted}
            />
        </section>
    );
}
