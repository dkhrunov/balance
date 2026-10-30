import { IconButton } from '@carbon/react';
import { Edit, TrashCan } from '@carbon/react/icons';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AccountBalance } from '@balance/domain/transactions';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '../../../../../shared/lib/money';
import { usePreferences } from '../../../../../shared/preferences';
import { Icon } from '../../../../../shared/ui/icon';
import styles from './account.module.scss';

type AccountProps = {
    readonly className?: string;
    readonly account: Account;
    readonly transactions: readonly Transaction[];
    readonly onEdit: () => void;
    readonly onDelete: () => void;
};

/**
 * Card contents only — RadioTile must stay a TileGroup descendant in the React tree.
 * Private to the accounts section slice (not re-exported from the barrel).
 */
export function Account({ className, account, transactions, onEdit, onDelete }: AccountProps) {
    const { t } = useTranslation();
    const { locale } = usePreferences();

    const balance = AccountBalance.derive(account.initialBalance, account.currency, transactions);

    return (
        <div className={className}>
            <div className={styles.cardHeader}>
                <Icon name={account.icon} size={16} />
                <span className={styles.cardName}>{account.name}</span>
            </div>

            <div className={styles.cardContent}>
                <p className={styles.cardBalance} data-ascii-digits>
                    {formatMoney(balance, account.currency, locale)}
                </p>
            </div>

            <div className={styles.cardActions} data-ascii="fade">
                <IconButton
                    kind="ghost"
                    size="sm"
                    label={t('accounts.actions.edit')}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onEdit();
                    }}
                    onKeyDown={(event) => {
                        event.stopPropagation();
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
                        onDelete();
                    }}
                    onKeyDown={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <TrashCan />
                </IconButton>
            </div>
        </div>
    );
}
