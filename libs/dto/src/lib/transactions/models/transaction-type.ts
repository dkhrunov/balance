export const INCOME_EXPENSE_TYPES = ['INCOME', 'EXPENSE'] as const;

export type IncomeExpenseType = (typeof INCOME_EXPENSE_TYPES)[number];

export const TRANSFER_TYPES = ['TRANSFER_OUT', 'TRANSFER_IN'] as const;

export type TransferType = (typeof TRANSFER_TYPES)[number];

export const TRANSACTION_TYPES = [...INCOME_EXPENSE_TYPES, ...TRANSFER_TYPES] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
