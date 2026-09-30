import { CurrencyCode } from '@balance/contracts/currencies';
import { Locale, Theme } from '@balance/contracts/users';

/** Persistence row shape for the `users` table. */
export type UserRecord = {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly passwordHash: string;
    readonly defaultCurrencyCode: CurrencyCode;
    readonly createdAt: Date;
};

/** Persistence row shape for user preference columns. */
export type UserPreferencesRecord = {
    readonly locale: Locale;
    readonly theme: Theme;
};
