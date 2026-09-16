import { CurrencyCode } from '@balance/contracts/currencies';

/** Persistence row shape for the `users` table. */
export type UserRecord = {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly passwordHash: string;
    readonly defaultCurrencyCode: CurrencyCode;
    readonly createdAt: Date;
};
