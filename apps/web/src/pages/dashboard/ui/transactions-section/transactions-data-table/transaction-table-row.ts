import { Transaction } from '@balance/dto/transactions';

/** Display row for the transactions DataTable (formatted cells, not domain Transaction). */
export type TransactionTableRow = {
    readonly id: Transaction['id'];
    readonly date: string;
    readonly type: string;
    readonly category: string;
    readonly description: string;
    readonly amount: string;
    readonly createdBy: string;
    readonly actions: string;
};

/** Column keys for {@link TransactionTableRow}, excluding the row `id`. */
export const TRANSACTION_TABLE_HEADER_KEYS = [
    'date',
    'type',
    'category',
    'description',
    'amount',
    'createdBy',
    'actions',
] as const satisfies readonly Exclude<keyof TransactionTableRow, 'id'>[];
