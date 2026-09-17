import { Locale } from './locale';
import { Theme } from './theme';

/** Per-user UI preferences shared by the API and web client. */
export interface UserPreferences {
    readonly locale: Locale;
    readonly theme: Theme;
}
