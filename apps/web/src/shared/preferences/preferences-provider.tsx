import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
    useRef,
} from 'react';
import { Locale, Theme, UserPreferences } from '@balance/contracts/users';
import { getUserPreferences, updateUserPreferences } from '../api';
import { useAuth } from '../auth';
import { applyLocale, isLocale, readCachedLocale } from '../i18n';
import { applyTheme, isTheme, readTheme } from '../theme';

export interface IPreferences {
    readonly locale: Locale;
    readonly theme: Theme;
    readonly isSyncing: boolean;
    readonly error: string | null;
    setLocale: (locale: Locale) => Promise<void>;
    setTheme: (theme: Theme) => Promise<void>;
}

const PreferencesContext = createContext<IPreferences | null>(null);

/**
 * Owns locale + theme state: local cache for first paint, API as authority when authenticated.
 * Preference reads/writes go through {@link usePreferences} only; use {@link useActiveTheme}
 * when UI needs a resolved light/dark appearance.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
    const { status } = useAuth();
    const [locale, setLocaleState] = useState<Locale>(readCachedLocale);
    const [theme, setThemeState] = useState<Theme>(readTheme);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const preferencesRef = useRef<UserPreferences>({ locale, theme });

    useEffect(() => {
        preferencesRef.current = { locale, theme };
    }, [locale, theme]);

    useEffect(() => {
        if (status !== 'authenticated') {
            return;
        }

        let cancelled = false;

        getUserPreferences()
            .then(async (preferences) => {
                if (cancelled) {
                    return;
                }

                await applyLocale(preferences.locale);
                applyTheme(preferences.theme);

                setLocaleState(preferences.locale);
                setThemeState(preferences.theme);
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

    const persistRemote = useCallback(async (preferences: UserPreferences): Promise<void> => {
        if (status !== 'authenticated') {
            return;
        }

        setIsSyncing(true);
        setError(null);

        try {
            await updateUserPreferences(preferences);
        } catch {
            setError('preferences.saveFailed');
            throw new Error('preferences.saveFailed');
        } finally {
            setIsSyncing(false);
        }
    }, [status]);

    const setLocale = useCallback(async (locale: Locale): Promise<void> => {
        if (!isLocale(locale)) {
            return;
        }

        const previous = preferencesRef.current;
        const next = { ...previous, locale: locale };

        await applyLocale(locale);
        setLocaleState(locale);
        preferencesRef.current = next;

        try {
            await persistRemote(next);
        } catch {
            await applyLocale(previous.locale);
            setLocaleState(previous.locale);
            preferencesRef.current = previous;
        }
    }, [persistRemote]);

    const setTheme = useCallback(async (theme: Theme): Promise<void> => {
        if (!isTheme(theme)) {
            return;
        }

        const previous = preferencesRef.current;
        const next = { ...previous, theme: theme };

        applyTheme(theme);
        setThemeState(theme);
        preferencesRef.current = next;

        try {
            await persistRemote(next);
        } catch {
            applyTheme(previous.theme);
            setThemeState(previous.theme);
            preferencesRef.current = previous;
        }
    }, [persistRemote]);

    const preferencesValue = useMemo(
        () => ({
            locale,
            theme,
            isSyncing,
            error,
            setLocale,
            setTheme,
        }),
        [locale, theme, isSyncing, error, setLocale, setTheme],
    );

    return (
        <PreferencesContext.Provider value={preferencesValue}>{children}</PreferencesContext.Provider>
    );
}

/** Returns locale/theme preferences and setters. Requires {@link PreferencesProvider}. */
export function usePreferences(): IPreferences {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }

    return context;
}
