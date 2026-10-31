import { CurrencyCode } from '@balance/domain/currency';

/** Row shape returned from `accounts` queries (camelCase aliases). */
export type AccountRecord = {
    id: string;
    name: string;
    icon: string;
    currency: CurrencyCode;
    initialBalance: string;
    version: number;
    createdBy: string;
    updatedBy: string;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
