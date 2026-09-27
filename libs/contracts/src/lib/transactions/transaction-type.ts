/** Income and expense kinds for this API; transfer types land with the transfer feature. */
export const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
