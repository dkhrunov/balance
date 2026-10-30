import { KeyboardEvent, useRef } from 'react';
import { Button, InlineNotification, RadioTile, TileGroup } from '@carbon/react';
import { Add, ChevronSort } from '@carbon/react/icons';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AsciiReveal, AsciiRevealHandle, AsciiSkeleton } from 'ascii-reveal';
import { useTranslation } from 'react-i18next';
import { useSettledAsciiReveal } from '../../../../shared/lib';
import { EmptyState } from '../../../../shared/ui/empty-state';
import { Account as AccountComponent } from './account';
import { AccountDeleteModal } from './account-delete-modal';
import { AccountFormModal } from './account-form-modal';
import { AccountReorderModal } from './account-reorder-modal';
import { useAccountsSection } from './use-accounts-section';
import styles from './accounts-section.module.scss';

const ACCOUNT_SKELETON_COUNT = 8;

/**
 * Carbon single-select tiles: one tab stop in the group; arrows move selection
 * (RadioTile defaults every input to tabIndex 0 and does not handle arrows).
 */
function adjacentAccountId(
    accounts: readonly Account[],
    currentId: Account['id'],
    direction: 1 | -1,
): Account['id'] | null {
    const currentIndex = accounts.findIndex((account) => account.id === currentId);

    if (currentIndex === -1) {
        return null;
    }

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= accounts.length) {
        return null;
    }

    return accounts[nextIndex]?.id ?? null;
}

function focusAccountTile(accountId: Account['id']) {
    const input = document.getElementById(`account-tile-${accountId}`);

    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    input.focus();
    input.closest(`.${styles.cardSlot}`)?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

function onAccountRadioArrowKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    accounts: readonly Account[],
    onSelectAccount: (accountId: Account['id'] | null) => void,
) {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== 'radio') {
        return;
    }

    let direction: 1 | -1 | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        direction = 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        direction = -1;
    }

    if (direction === null) {
        return;
    }

    event.preventDefault();
    const nextId = adjacentAccountId(accounts, event.target.value as Account['id'], direction);

    if (!nextId) {
        return;
    }

    onSelectAccount(nextId);
    requestAnimationFrame(() => focusAccountTile(nextId));
}

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
        !section.showSkeleton &&
        selectionSettled &&
        (showReady || showError);

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
                    <TileGroup
                        className={styles.carousel}
                        name="dashboard-accounts"
                        valueSelected={selectedAccountId ?? undefined}
                        aria-labelledby="dashboard-accounts-heading"
                        onChange={(selection) => {
                            onSelectAccountId(String(selection) as Account['id']);
                        }}
                    >
                        {section.orderedAccounts.map((account) => {
                            const tabStopId =
                                selectedAccountId ?? section.orderedAccounts[0]?.id ?? null;

                            return (
                                // TileGroup walks props.children for RadioTile — keep it in this tree
                                // (not hidden inside a custom component that renders it).
                                <div
                                    key={account.id}
                                    className={styles.cardSlot}
                                    onKeyDown={(event) => {
                                        onAccountRadioArrowKeyDown(
                                            event,
                                            section.orderedAccounts,
                                            onSelectAccountId,
                                        );
                                    }}
                                >
                                    <RadioTile
                                        id={`account-tile-${account.id}`}
                                        value={account.id}
                                        tabIndex={account.id === tabStopId ? 0 : -1}
                                        data-ascii="surface"
                                    >
                                        <AccountComponent
                                            className={styles.card}
                                            account={account}
                                            transactions={
                                                account.id === selectedAccountId
                                                    ? selectedAccountTransactions
                                                    : []
                                            }
                                            onEdit={() => section.openEdit(account)}
                                            onDelete={() => section.openDelete(account)}
                                        />
                                    </RadioTile>
                                </div>
                            );
                        })}
                    </TileGroup>
                ) : null}

                {section.showSkeleton ? (
                    <div className={styles.carousel} aria-hidden>
                        {Array.from({ length: ACCOUNT_SKELETON_COUNT }, (_, index) => (
                            <AccountTileSkeleton key={index} seed={index * 5} animate={index < 3} />
                        ))}
                    </div>
                ) : null}
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
        </section >
    );
}

type AccountTileSkeletonProps = {
    readonly seed: number;
    readonly animate: boolean;
};

function AccountTileSkeleton({ seed, animate }: AccountTileSkeletonProps) {
    return (
        <div className={styles.cardSlot}>
            <div className={`${styles.card} ${styles.cardSkeleton}`}>
                <div className={styles.skeletonCardHeader}>
                    <AsciiSkeleton
                        variant="dither"
                        rows={2}
                        width="1rem"
                        height="1rem"
                        circle
                        seed={seed}
                        animate={animate}
                    />
                    <div className={styles.skeletonCardName}>
                        <AsciiSkeleton
                            variant="dither"
                            lines={1}
                            widths={['5rem']}
                            seed={seed + 1}
                            animate={animate}
                        />
                    </div>
                </div>

                <div className={styles.skeletonCardContent}>
                    <div className={styles.skeletonCardBalance}>
                        <AsciiSkeleton
                            variant="dither"
                            lines={1}
                            widths={['100%']}
                            seed={seed + 2}
                            animate={animate}
                        />
                    </div>
                </div>

                <div className={styles.skeletonCardActions}>
                    <AsciiSkeleton
                        variant="dither"
                        rows={2}
                        width="2rem"
                        height="2rem"
                        seed={seed + 3}
                        animate={false}
                    />
                    <AsciiSkeleton
                        variant="dither"
                        rows={2}
                        width="2rem"
                        height="2rem"
                        seed={seed + 4}
                        animate={false}
                    />
                </div>
            </div>
        </div>
    );
}
