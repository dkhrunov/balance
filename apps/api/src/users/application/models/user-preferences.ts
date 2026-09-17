import { Locale, Theme } from '@balance/contracts/users';

/**
 * Application model of persisted UI preferences for a user.
 * Mapped to/from the `users` table locale and theme columns.
 */
export type UserPreferencesModel = {
    readonly locale: Locale;
    readonly theme: Theme;
};
