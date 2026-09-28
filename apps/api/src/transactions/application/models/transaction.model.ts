import { CurrencyCode } from '@balance/contracts/currencies';
import { TransactionType } from '@balance/contracts/transactions';

/** Application-layer transaction used by use cases and the repository. */
export type TransactionModel = {
    readonly id: string;
    readonly type: TransactionType;
    readonly accountId: string;
    readonly categoryId: string | null;
    readonly transferGroupId: string | null;
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: string;
    readonly description: string;
    readonly version: number;
    readonly createdBy: string;
    readonly updatedBy: string;
    readonly deletedBy: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};
