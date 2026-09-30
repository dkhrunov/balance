import { CurrencyCode } from '@balance/dto/currencies';
import { TransactionType } from '@balance/dto/transactions';

/** Row shape returned from `transactions` queries (camelCase aliases). */
export type TransactionRecord = {
    id: string;
    type: TransactionType;
    accountId: string;
    categoryId: string | null;
    transferGroupId: string | null;
    amount: string;
    currency: CurrencyCode;
    transactionDate: string;
    description: string;
    version: number;
    createdBy: string;
    updatedBy: string;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
