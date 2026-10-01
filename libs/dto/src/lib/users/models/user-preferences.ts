import { EntityId } from '../../common';
import { Locale } from './locale';
import { Theme } from './theme';

/** Per-user UI preferences shared by the API and web client. */
export interface UserPreferences {
    readonly locale: Locale;
    readonly theme: Theme;
    /**
     * Preferred display order of account ids for the dashboard carousel.
     * Unknown or deleted ids are ignored by clients; missing accounts are appended.
     */
    readonly accountOrder: readonly EntityId[];
}
