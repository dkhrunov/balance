import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

/** User-selected theme mode persisted across sessions. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** Resolved light/dark appearance after applying {@link ThemePreference}. */
export type ActiveTheme = 'light' | 'dark';

/** `localStorage` key for {@link ThemePreference}. */
export const THEME_PREFERENCE_STORAGE_KEY = 'balance.themePreference';

const LIGHT_CARBON_THEME = 'white';
const DARK_CARBON_THEME = 'g100';

type ThemePreferenceContextValue = {
    preference: ThemePreference;
    setPreference: (preference: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

/** Type guard for values read from storage or API payloads. */
export function isThemePreference(value: unknown): value is ThemePreference {
    return value === 'light' || value === 'dark' || value === 'system';
}

function applyThemePreference(preference: ThemePreference): void {
    const root = document.documentElement;

    switch (preference) {
        case 'light':
            root.setAttribute('data-carbon-theme', LIGHT_CARBON_THEME);
            break;
        case 'dark':
            root.setAttribute('data-carbon-theme', DARK_CARBON_THEME);
            break;
        default:
            root.removeAttribute('data-carbon-theme');
            break;
    }
}

function readThemePreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
        return isThemePreference(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

function persistThemePreference(preference: ThemePreference): void {
    try {
        localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
    } catch {
        // Private mode or blocked storage: keep the in-memory preference.
    }
}

/** Applies Carbon `data-carbon-theme` on `<html>` and exposes read/update API. */
export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>(readThemePreference);

    useLayoutEffect(() => {
        applyThemePreference(preference);
    }, [preference]);

    const setPreference = useCallback((next: ThemePreference) => {
        persistThemePreference(next);
        applyThemePreference(next);
        setPreferenceState(next);
    }, []);

    const value = useMemo(
        () => ({ preference, setPreference }),
        [preference, setPreference],
    );

    return (
        <ThemePreferenceContext.Provider value={value}>
            {children}
        </ThemePreferenceContext.Provider>
    );
}

/** Returns the stored theme preference and setter. Requires {@link ThemePreferenceProvider}. */
export function useThemePreference(): ThemePreferenceContextValue {
    const context = useContext(ThemePreferenceContext);

    if (!context) {
        throw new Error('useThemePreference must be used within ThemePreferenceProvider');
    }

    return context;
}

function readSystemPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Returns the theme currently in effect for UI that needs a concrete light/dark choice.
 * When preference is `system`, follows `prefers-color-scheme` and updates on OS changes.
 */
export function useActiveTheme(): ActiveTheme {
    const { preference } = useThemePreference();
    const [systemPrefersDark, setSystemPrefersDark] = useState(readSystemPrefersDark);

    useEffect(() => {
        if (preference !== 'system') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setSystemPrefersDark(media.matches);

        onChange();
        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, [preference]);

    if (preference === 'light') {
        return 'light';
    }

    if (preference === 'dark') {
        return 'dark';
    }

    return systemPrefersDark ? 'dark' : 'light';
}
