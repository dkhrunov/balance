import { InlineNotification } from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { Transaction } from '@balance/dto/transactions';
import { AsciiReveal, AsciiSkeleton } from 'ascii-reveal';
import { useTranslation } from 'react-i18next';
import { LoadState } from '../../../../shared/lib/load-state';
import { EmptyState } from '../../../../shared/ui/empty-state';
import { TransactionDeleteModal } from './transaction-delete-modal';
import { TransactionFormModal } from './transaction-form-modal';
import { TransferFormModal } from './transfer-form-modal';
import { TransactionsDataTable } from './transactions-data-table';
import { useTransactionsSection } from './use-transactions-section';
import styles from './transactions-section.module.scss';

type TransactionsTableSkeletonProps = {
    readonly columnCount: number;
    readonly rowCount: number;
};

/** ASCII placeholder that mirrors the transactions DataTable grid. */
function TransactionsTableSkeleton({ columnCount, rowCount }: TransactionsTableSkeletonProps) {
    return (
        <div className={styles.tableSkeleton} aria-hidden>
            <AsciiSkeleton
                className={styles.toolbarSkeleton}
                lines={1}
                widths={['12rem', '8rem']}
                seed={0}
            />
            <div className={styles.tableSkeletonHeader}>
                {Array.from({ length: columnCount }, (_, index) => (
                    <AsciiSkeleton
                        key={index}
                        lines={1}
                        widths={['80%']}
                        seed={index + 1}
                        animate={false}
                    />
                ))}
            </div>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
                <div key={rowIndex} className={styles.tableSkeletonRow}>
                    {Array.from({ length: columnCount }, (_, columnIndex) => (
                        <AsciiSkeleton
                            key={columnIndex}
                            lines={1}
                            widths={['90%']}
                            seed={columnIndex * 10 + columnIndex + 20}
                            animate={columnIndex < 2}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

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

    const showTable = !section.showSkeleton && transactionsLoadState === 'ready';

    const showError = !section.showSkeleton && transactionsLoadState === 'error';

    const transactionForm =
        account && section.activeForm?.kind === 'transaction' ? section.activeForm : null;

    const transferForm =
        account && section.activeForm?.kind === 'transfer' ? section.activeForm : null;

    if (!account && !section.showSkeleton) {
        return (
            <section className={styles.section} aria-labelledby="dashboard-transactions-heading">
                <h4 className={styles.header} id="dashboard-transactions-heading">
                    {t('transactions.title')}
                </h4>
                <AsciiReveal>
                    <EmptyState
                        title={t('transactions.selectAccountTitle')}
                        body={t('transactions.selectAccountBody')}
                    />
                </AsciiReveal>
            </section>
        );
    }

    return (
        <section className={styles.section} aria-labelledby="dashboard-transactions-heading">
            <h4 className={styles.header} id="dashboard-transactions-heading">
                {t('transactions.title')}
            </h4>

            <AsciiReveal loading={section.showSkeleton}>
                {section.showSkeleton ? <TransactionsTableSkeleton rowCount={10} columnCount={7} /> : null}

                {showError ? (
                    <InlineNotification
                        kind="error"
                        title={t('transactions.cannotLoad')}
                        subtitle={t('transactions.loadError')}
                        lowContrast
                        hideCloseButton
                    />
                ) : null}

                {showTable ? (
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
            </AsciiReveal>

            {account && transactionForm ? (
                <TransactionFormModal
                    open
                    type={transactionForm.type}
                    account={account}
                    categories={
                        transactionForm.type === 'INCOME'
                            ? section.incomeCategories
                            : section.expenseCategories
                    }
                    transaction={transactionForm.transaction}
                    onClose={section.closeForm}
                    onSaved={onTransactionsChanged}
                />
            ) : null}

            {account && transferForm ? (
                <TransferFormModal
                    open
                    account={account}
                    transaction={transferForm.transaction}
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
