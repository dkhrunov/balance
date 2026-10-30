import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode, useRef } from 'react';
import { EntityId } from '@balance/dto/common';
import { Locale, Theme, UserPreferences } from '@balance/dto/users';
import { UserPreferencesApi } from '../api';
import { useAuth } from '../auth';
import { applyLocale, isLocale, readCachedLocale } from '../i18n';
// Import theme primitives directly (not the segment barrel) to avoid a cycle with
// `useActiveTheme` in `shared/theme`, which depends on this provider.
import { applyTheme, isTheme, readTheme } from '../theme/theme';

export interface IPreferences {
    readonly locale: Locale;
    readonly theme: Theme;
    readonly accountOrder: readonly EntityId[];
    readonly isSyncing: boolean;
    readonly error: string | null;
    setLocale: (locale: Locale) => Promise<void>;
    setTheme: (theme: Theme) => Promise<void>;
    setAccountOrder: (accountOrder: readonly EntityId[]) => Promise<void>;
}

const PreferencesContext = createContext<IPreferences | null>(null);

const EMPTY_ACCOUNT_ORDER: readonly EntityId[] = [];

/**
 * Owns locale + theme + account order: local cache for first paint, API as authority when authenticated.
 * Preference reads/writes go through {@link usePreferences} only; use `useActiveTheme`
 * from `shared/theme` when UI needs a resolved light/dark appearance.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
    const { status } = useAuth();
    const [locale, setLocaleState] = useState<Locale>(readCachedLocale);
    const [theme, setThemeState] = useState<Theme>(readTheme);
    const [accountOrder, setAccountOrderState] = useState<readonly EntityId[]>(EMPTY_ACCOUNT_ORDER);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const preferencesRef = useRef<UserPreferences>({ locale, theme, accountOrder });

    useEffect(() => {
        preferencesRef.current = { locale, theme, accountOrder };
    }, [locale, theme, accountOrder]);

    useEffect(() => {
        if (status !== 'authenticated') {
            return;
        }

        let cancelled = false;

        UserPreferencesApi.getUserPreferences()
            .then(async (preferences) => {
                if (cancelled) {
                    return;
                }

                await applyLocale(preferences.locale);
                applyTheme(preferences.theme);

                setLocaleState(preferences.locale);
                setThemeState(preferences.theme);
                setAccountOrderState(preferences.accountOrder);
                setError(null);
            })
            .catch(() => {
                if (!cancelled) {
                    // Keep cached preferences when online fetch fails.
                    setError(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [status]);

    const persistRemote = useCallback(
        async (preferences: UserPreferences): Promise<void> => {
            if (status !== 'authenticated') {
                return;
            }

            setIsSyncing(true);
            setError(null);

            try {
                await UserPreferencesApi.updateUserPreferences(preferences);
            } catch {
                setError('preferences.saveFailed');
                throw new Error('preferences.saveFailed');
            } finally {
                setIsSyncing(false);
            }
        },
        [status],
    );

    const setLocale = useCallback(
        async (nextLocale: Locale): Promise<void> => {
            if (!isLocale(nextLocale)) {
                return;
            }

            const previous = preferencesRef.current;
            const next = { ...previous, locale: nextLocale };

            await applyLocale(nextLocale);
            setLocaleState(nextLocale);
            preferencesRef.current = next;

            try {
                await persistRemote(next);
            } catch {
                await applyLocale(previous.locale);
                setLocaleState(previous.locale);
                preferencesRef.current = previous;
            }
        },
        [persistRemote],
    );

    const setTheme = useCallback(
        async (nextTheme: Theme): Promise<void> => {
            if (!isTheme(nextTheme)) {
                return;
            }

            const previous = preferencesRef.current;
            const next = { ...previous, theme: nextTheme };

            applyTheme(nextTheme);
            setThemeState(nextTheme);
            preferencesRef.current = next;

            try {
                await persistRemote(next);
            } catch {
                applyTheme(previous.theme);
                setThemeState(previous.theme);
                preferencesRef.current = previous;
            }
        },
        [persistRemote],
    );

    const setAccountOrder = useCallback(
        async (nextOrder: readonly EntityId[]): Promise<void> => {
            const previous = preferencesRef.current;
            const next = { ...previous, accountOrder: nextOrder };

            setAccountOrderState(nextOrder);
            preferencesRef.current = next;

            try {
                await persistRemote(next);
            } catch {
                setAccountOrderState(previous.accountOrder);
                preferencesRef.current = previous;
            }
        },
        [persistRemote],
    );

    const preferencesValue = useMemo(
        () => ({
            locale,
            theme,
            accountOrder,
            isSyncing,
            error,
            setLocale,
            setTheme,
            setAccountOrder,
        }),
        [locale, theme, accountOrder, isSyncing, error, setLocale, setTheme, setAccountOrder],
    );

    return <PreferencesContext.Provider value={preferencesValue}>{children}</PreferencesContext.Provider>;
}

/** Returns locale/theme/account-order preferences and setters. Requires {@link PreferencesProvider}. */
export function usePreferences(): IPreferences {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }

    return context;
}
