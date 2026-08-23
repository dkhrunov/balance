/** Supported user-interface locales. */
export type Locale = 'en' | 'ru';

/** Persisted Carbon-compatible theme preference. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Per-user UI preferences shared by the API and web client. */
export interface UserPreferences {
    readonly locale: Locale;
    readonly theme: ThemePreference;
}

/**
 * Placeholder for user identity and preference API DTOs.
 * Endpoint request and response types are added with the users features.
 */
export interface UsersContractPlaceholder {
    readonly feature: 'users';
}
