import { AccountIcon } from '@balance/dto/accounts';
import { CurrencyCode } from '@balance/dto/currencies';

/** Row shape returned from `accounts` queries (camelCase aliases). */
export type AccountRecord = {
    id: string;
    name: string;
    icon: AccountIcon;
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
