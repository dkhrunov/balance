import {
    DataTable,
    DataTableProps,
    Dropdown,
    IconButton,
    MenuButton,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
} from '@carbon/react';
import { ArrowsHorizontal, Edit, TrashCan } from '@carbon/react/icons';
import { Category } from '@balance/dto/categories';
import { Transaction } from '@balance/dto/transactions';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../../../shared/ui/empty-state';
import { Icon } from '../../../../../shared/ui/icon';
import { TransactionCreateIntent } from '../transaction-create-intent';
import { FilterItem, TypeFilter } from '../transaction-filters';
import { TransactionTableRow } from './transaction-table-row';
import styles from './transactions-data-table.module.scss';

type FilterRowsOptions = Parameters<
    NonNullable<DataTableProps<unknown, unknown[]>['filterRows']>
>[0];

/**
 * Filters DataTable row ids by toolbar search, including raw money amount strings.
 */
function filterRows(
    options: FilterRowsOptions,
    transactionsMap: ReadonlyMap<Transaction['id'], Transaction>,
): string[] {
    const query = options.inputValue.trim().toLocaleLowerCase();

    if (!query) {
        return [...options.rowIds];
    }

    return options.rowIds.filter((rowId) => {
        const transaction = transactionsMap.get(rowId as Transaction['id']);

        if (transaction?.amount.toLocaleLowerCase().includes(query)) {
            return true;
        }

        return options.headers.some((header) => {
            if (header.key === 'actions') {
                return false;
            }

            const cell = options.cellsById[options.getCellId(rowId, header.key)];

            return String(cell?.value ?? '')
                .toLocaleLowerCase()
                .includes(query);
        });
    });
}

type TransactionsDataTableProps = {
    readonly rows: TransactionTableRow[];
    readonly headers: { readonly key: string; readonly header: string }[];
    readonly transactionsMap: ReadonlyMap<Transaction['id'], Transaction>;
    readonly categoriesMap: ReadonlyMap<Category['id'], Category>;
    readonly typeFilter: TypeFilter;
    readonly typeItems: FilterItem<TypeFilter>[];
    readonly onTypeFilterChange: (value: TypeFilter) => void;
    readonly onCreate: (intent: TransactionCreateIntent) => void;
    readonly onEdit: (transaction: Transaction) => void;
    readonly onDelete: (transaction: Transaction) => void;
};

/**
 * Carbon DataTable with TableToolbarSearch, filters, and create actions.
 * Private to the transactions section slice (not re-exported from the barrel).
 */
export function TransactionsDataTable({
    rows,
    headers,
    transactionsMap,
    categoriesMap,
    typeFilter,
    typeItems,
    onTypeFilterChange,
    onCreate,
    onEdit,
    onDelete,
}: TransactionsDataTableProps) {
    const { t } = useTranslation();

    return (
        <DataTable
            rows={[...rows]}
            headers={[...headers]}
            size="md"
            useZebraStyles
            filterRows={(options) => filterRows(options, transactionsMap)}
        >
            {({
                rows: tableRows,
                headers: tableHeaders,
                getHeaderProps,
                getRowProps,
                getTableProps,
                getToolbarProps,
                getCellProps,
                onInputChange,
            }) => (
                <TableContainer>
                    <TableToolbar {...getToolbarProps()} aria-label={t('transactions.title')}>
                        <TableToolbarContent>
                            <TableToolbarSearch
                                persistent
                                id="transactions-toolbar-search"
                                placeholder={t('transactions.search')}
                                labelText={t('transactions.search')}
                                onChange={onInputChange}
                                onClear={() => onInputChange('')}
                            />
                            <Dropdown
                                id="transactions-filter-type"
                                titleText={t('transactions.filters.type')}
                                label={t('transactions.filters.type')}
                                hideLabel
                                type="inline"
                                size="lg"
                                items={[...typeItems]}
                                itemToString={(item: FilterItem<TypeFilter> | null) =>
                                    item?.label ?? ''
                                }
                                selectedItem={
                                    typeItems.find((item) => item.id === typeFilter) ?? null
                                }
                                onChange={({
                                    selectedItem,
                                }: {
                                    selectedItem: FilterItem<TypeFilter> | null;
                                }) => {
                                    if (selectedItem) {
                                        onTypeFilterChange(selectedItem.id);
                                    }
                                }}
                            />
                            <MenuButton
                                label={t('transactions.actions.add')}
                                kind="primary"
                                size="lg"
                                menuAlignment="bottom-end"
                            >
                                <MenuItem
                                    label={t('transactions.types.EXPENSE')}
                                    onClick={() => onCreate('EXPENSE')}
                                />
                                <MenuItem
                                    label={t('transactions.types.INCOME')}
                                    onClick={() => onCreate('INCOME')}
                                />
                                <MenuItem
                                    label={t('transactions.modes.transfer')}
                                    onClick={() => onCreate('TRANSFER')}
                                />
                            </MenuButton>
                        </TableToolbarContent>
                    </TableToolbar>

                    {tableRows.length === 0 ? (
                        <EmptyState
                            illustrationKind="noResults"
                            title={t('transactions.emptyTitle')}
                            body={t('transactions.emptyBody')}
                        />
                    ) : (
                        <Table {...getTableProps()} aria-label={t('transactions.title')}>
                            <TableHead>
                                <TableRow>
                                    {tableHeaders.map((header) => {
                                        const { key, ...headerProps } = getHeaderProps({ header });

                                        return (
                                            <TableHeader key={key} {...headerProps}>
                                                {header.header}
                                            </TableHeader>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableRows.map((row) => {
                                    const transaction =
                                        transactionsMap.get(row.id as Transaction['id']) ?? null;
                                    const { key, ...rowProps } = getRowProps({ row });

                                    return (
                                        <TableRow key={key} {...rowProps}>
                                            {row.cells.map((cell) => {
                                                const { key: cellKey, ...cellProps } = getCellProps({
                                                    cell,
                                                });

                                                return (
                                                    <TransactionDataCell
                                                        key={cellKey}
                                                        headerKey={cell.info.header}
                                                        value={cell.value}
                                                        cellProps={cellProps}
                                                        transaction={transaction}
                                                        categoriesMap={categoriesMap}
                                                        onEdit={onEdit}
                                                        onDelete={onDelete}
                                                    />
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            )}
        </DataTable>
    );
}

type TransactionDataCellProps = {
    readonly headerKey: string;
    readonly value: unknown;
    readonly cellProps: Record<string, unknown>;
    readonly transaction: Transaction | null;
    readonly categoriesMap: ReadonlyMap<Category['id'], Category>;
    readonly onEdit: (transaction: Transaction) => void;
    readonly onDelete: (transaction: Transaction) => void;
};

/**
 * Renders a single transactions cell, specializing category / amount / actions columns.
 */
function TransactionDataCell({
    headerKey,
    value,
    cellProps,
    transaction,
    categoriesMap,
    onEdit,
    onDelete,
}: TransactionDataCellProps) {
    if (headerKey === 'category' && transaction) {
        return (
            <CategoryDataCell
                value={value}
                cellProps={cellProps}
                transaction={transaction}
                categoriesMap={categoriesMap}
            />
        );
    }

    if (headerKey === 'amount' && transaction) {
        return <AmountDataCell value={value} cellProps={cellProps} />;
    }

    if (headerKey === 'actions' && transaction) {
        return (
            <TableCell {...cellProps}>
                <TransactionRowActions
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </TableCell>
        );
    }

    return <TableCell {...cellProps}>{String(value)}</TableCell>;
}

type CategoryDataCellProps = {
    readonly value: unknown;
    readonly cellProps: Record<string, unknown>;
    readonly transaction: Transaction;
    readonly categoriesMap: ReadonlyMap<Category['id'], Category>;
};

function CategoryDataCell({
    value,
    cellProps,
    transaction,
    categoriesMap,
}: CategoryDataCellProps) {
    const category = transaction.categoryId ? categoriesMap.get(transaction.categoryId) : null;
    const isTransfer = transaction.type === 'TRANSFER_IN' || transaction.type === 'TRANSFER_OUT';
    let categoryIcon = null;

    if (category) {
        categoryIcon = <Icon name={category.icon} size={16} />;
    } else if (isTransfer) {
        categoryIcon = <ArrowsHorizontal size={16} />;
    }

    return (
        <TableCell {...cellProps}>
            <span className={styles.categoryCell}>
                {categoryIcon}
                <span>{String(value)}</span>
            </span>
        </TableCell>
    );
}

type AmountDataCellProps = {
    readonly value: unknown;
    readonly cellProps: Record<string, unknown>;
};

function AmountDataCell({ value, cellProps }: AmountDataCellProps) {
    return (
        <TableCell {...cellProps}>
            {String(value)}
        </TableCell>
    );
}

type TransactionRowActionsProps = {
    readonly transaction: Transaction;
    readonly onEdit: (transaction: Transaction) => void;
    readonly onDelete: (transaction: Transaction) => void;
};

/**
 * Inline edit/delete actions for a transaction row.
 */
function TransactionRowActions({
    transaction,
    onEdit,
    onDelete,
}: TransactionRowActionsProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.rowActions}>
            <IconButton
                kind="ghost"
                size="sm"
                label={t('transactions.actions.edit')}
                onClick={() => onEdit(transaction)}
            >
                <Edit />
            </IconButton>
            <IconButton
                kind="ghost"
                size="sm"
                label={t('transactions.actions.delete')}
                onClick={() => onDelete(transaction)}
            >
                <TrashCan />
            </IconButton>
        </div>
    );
}
