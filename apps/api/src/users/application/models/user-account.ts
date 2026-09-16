import { CurrencyCode } from '@balance/contracts/currencies';

/**
 * Application model of a user account including credential material.
 * Used by credential verification; never returned on public HTTP responses.
 */
export type UserAccount = {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly passwordHash: string;
    readonly defaultCurrencyCode: CurrencyCode;
    readonly createdAt: Date;
};
