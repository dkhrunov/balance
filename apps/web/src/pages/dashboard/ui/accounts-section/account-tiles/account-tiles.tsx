import { IconButton, RadioTile, TileGroup } from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AccountBalance } from '@balance/domain/transactions';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../../../../shared/lib/money';
import { usePreferences } from '../../../../../shared/preferences';
import { Icon } from '../../../../../shared/ui/icon';
import styles from './account-tiles.module.scss';

type AccountTilesProps = {
    /** Accounts shown as selectable tiles, in display order. */
    readonly accounts: readonly Account[];
    /** Currently selected account id, or null when none. */
    readonly selectedAccountId: Account['id'] | null;
    /** Transactions for the selected account (used to derive that card’s balance). */
    readonly selectedAccountTransactions: readonly Transaction[];
    /** Notifies when the user selects an account tile. */
    readonly onSelectAccountId: (accountId: Account['id'] | null) => void;
    /** Opens the edit flow for the given account. */
    readonly onEdit: (account: Account) => void;
    /** Opens the delete flow for the given account. */
    readonly onDelete: (account: Account) => void;
};

/**
 * Horizontal single-select account carousel (Carbon TileGroup + RadioTile).
 *
 * RadioTile must stay a TileGroup descendant in this React tree — do not wrap
 * it inside a custom component that hides it from `props.children`.
 */
export function AccountTiles({
    accounts,
    selectedAccountId,
    selectedAccountTransactions,
    onSelectAccountId,
    onEdit,
    onDelete,
}: AccountTilesProps) {
    const { t } = useTranslation();
    const { locale } = usePreferences();

    return (
        <TileGroup
            className={styles.carousel}
            name="dashboard-accounts"
            valueSelected={selectedAccountId ?? undefined}
            aria-labelledby="dashboard-accounts-heading"
            onChange={(selection) => {
                onSelectAccountId(String(selection) as Account['id']);
            }}
        >
            {accounts.map((account) => {
                const transactions =
                    account.id === selectedAccountId ? selectedAccountTransactions : [];

                const balance = AccountBalance.derive(
                    account.initialBalance,
                    account.currency,
                    transactions,
                );

                return (
                    <div key={account.id} className={styles.accountTileWrapper}>
                        <RadioTile
                            id={`account-tile-${account.id}`}
                            value={account.id}
                            data-ascii="surface"
                        >
                            <div className={styles.account}>
                                <div className={styles.header}>
                                    <Icon name={account.icon} size={16} />
                                    <span className={styles.accountName}>{account.name}</span>
                                </div>

                                <p className={styles.accountBalance} data-ascii-digits>
                                    {formatMoney(balance, account.currency, locale)}
                                </p>

                                <div className={styles.actions} data-ascii="fade">
                                    <IconButton
                                        kind="ghost"
                                        size="sm"
                                        label={t('accounts.actions.edit')}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            onEdit(account);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        kind="ghost"
                                        size="sm"
                                        label={t('accounts.actions.delete')}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            onDelete(account);
                                        }}
                                    >
                                        <TrashCan />
                                    </IconButton>
                                </div>
                            </div>
                        </RadioTile>
                    </div>
                );
            })}
        </TileGroup>
    );
}
