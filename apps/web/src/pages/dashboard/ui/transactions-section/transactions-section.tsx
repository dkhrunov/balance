import { DataTableSkeleton, InlineNotification } from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { useTranslation } from 'react-i18next';
import { LoadState } from '../../../../shared/lib/load-state';
import { EmptyState } from '../../../../shared/ui/empty-state';
import { TransactionDeleteModal } from './transaction-delete-modal';
import { TransactionFormModal } from './transaction-form-modal';
import { TransferFormModal } from './transfer-form-modal';
import { TransactionsDataTable } from './transactions-data-table';
import { useTransactionsSection } from './use-transactions-section';
import styles from './transactions-section.module.scss';

type TransactionsSectionProps = {
    readonly account: Account | null;
    readonly transactions: readonly Transaction[];
    readonly transactionsLoadState: LoadState;
    readonly onTransactionsChanged: () => void;
};

/**
 * Selected-account transactions table with DataTable toolbar search/filters
 * and income/expense/transfer create/edit flows.
 */
export function TransactionsSection({
    account,
    transactions,
    transactionsLoadState,
    onTransactionsChanged,
}: TransactionsSectionProps) {
    const { t } = useTranslation();
    const section = useTransactionsSection({
        account,
        transactions,
        transactionsLoadState,
    });

    if (!account && !section.showSkeleton) {
        return (
            <section className={styles.section} aria-labelledby="dashboard-transactions-heading">
                <h4 className={styles.header} id="dashboard-transactions-heading">
                    {t('transactions.title')}
                </h4>
                <EmptyState
                    title={t('transactions.selectAccountTitle')}
                    body={t('transactions.selectAccountBody')}
                />
            </section>
        );
    }

    return (
        <section className={styles.section} aria-labelledby="dashboard-transactions-heading">
            <h4 className={styles.header} id="dashboard-transactions-heading">
                {t('transactions.title')}
            </h4>

            {section.showSkeleton ? (
                <DataTableSkeleton
                    className={styles.tableSkeleton}
                    size="md"
                    showHeader={false}
                    showToolbar
                    columnCount={7}
                    rowCount={5}
                    headers={section.headers.map((header) => ({ header: header.header }))}
                />
            ) : null}

            {!section.showSkeleton && transactionsLoadState === 'error' ? (
                <InlineNotification
                    kind="error"
                    title={t('transactions.cannotLoad')}
                    subtitle={t('transactions.loadError')}
                    lowContrast
                    hideCloseButton
                />
            ) : null}

            {!section.showSkeleton && transactionsLoadState === 'ready' ? (
                <TransactionsDataTable
                    rows={section.rows}
                    headers={section.headers}
                    transactionsMap={section.transactionsMap}
                    categoriesMap={section.categoriesMap}
                    typeFilter={section.typeFilter}
                    typeItems={section.typeItems}
                    onTypeFilterChange={section.setTypeFilter}
                    onCreate={section.openCreate}
                    onEdit={section.openEdit}
                    onDelete={section.openDelete}
                />
            ) : null}

            {account && section.activeForm?.kind === 'transaction' ? (
                <TransactionFormModal
                    open
                    type={section.activeForm.type}
                    account={account}
                    categories={
                        section.activeForm.type === 'INCOME'
                            ? section.incomeCategories
                            : section.expenseCategories
                    }
                    transaction={section.activeForm.transaction}
                    onClose={section.closeForm}
                    onSaved={onTransactionsChanged}
                />
            ) : null}

            {account && section.activeForm?.kind === 'transfer' ? (
                <TransferFormModal
                    open
                    account={account}
                    transaction={section.activeForm.transaction}
                    onClose={section.closeForm}
                    onSaved={onTransactionsChanged}
                />
            ) : null}

            <TransactionDeleteModal
                open={section.deleting !== null}
                transaction={section.deleting}
                onClose={section.closeDelete}
                onDeleted={onTransactionsChanged}
            />
        </section>
    );
}
