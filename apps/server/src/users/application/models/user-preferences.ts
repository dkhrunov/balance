import { Locale, Theme } from '@balance/dto/users';

/**
 * Application model of persisted UI preferences for a user.
 * Mapped to/from the `users` table preference columns.
 */
export type UserPreferencesModel = {
    readonly locale: Locale;
    readonly theme: Theme;
    readonly accountOrder: readonly string[];
};
