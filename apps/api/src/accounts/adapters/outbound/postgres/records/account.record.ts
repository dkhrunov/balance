import { CurrencyCode } from '@balance/contracts/currencies';

/** Row shape returned from `accounts` queries (camelCase aliases). */
export type AccountRecord = {
    id: string;
    name: string;
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
