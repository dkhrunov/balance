import { IncomeExpenseType } from '@balance/domain/transactions';

/** Row shape returned from `categories` queries (camelCase aliases). */
export type CategoryRecord = {
    id: string;
    type: IncomeExpenseType;
    name: string;
    icon: string;
    version: number;
    createdBy: string;
    updatedBy: string;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
