import { Locale } from './locale';
import { ThemePreference } from './theme-preference';

/** Per-user UI preferences shared by the API and web client. */
export interface UserPreferences {
    readonly locale: Locale;
    readonly theme: ThemePreference;
}
