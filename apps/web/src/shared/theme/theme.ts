import { Theme } from '@balance/contracts/users';

/** Resolved light/dark appearance after applying {@link Theme}. */
export type ActiveTheme = 'light' | 'dark';

/**
 * `localStorage` key for {@link Theme}.
 * Value string kept for continuity with existing client caches.
 */
export const THEME_STORAGE_KEY = 'balance.themePreference';

const LIGHT_CARBON_THEME = 'white';
const DARK_CARBON_THEME = 'g100';

/** Type guard for values read from storage or API payloads. */
export function isTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Applies Carbon `data-carbon-theme` on `<html>` and caches the theme
 * for offline / first-paint continuity.
 */
export function applyTheme(theme: Theme): void {
    persistTheme(theme);

    const root = document.documentElement;

    switch (theme) {
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

/** Reads the cached theme, defaulting to `system`. */
export function readTheme(): Theme {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);

        return isTheme(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

/** Writes the theme to `localStorage` (used by {@link applyTheme}). */
export function persistTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Private mode or blocked storage: keep the in-memory theme.
    }
}

/**
 * Resolves a stored {@link Theme} preference to a concrete light/dark appearance.
 */
export function resolveActiveTheme(theme: Theme, systemPrefersDark: boolean): ActiveTheme {
    if (theme === 'light') {
        return 'light';
    }

    if (theme === 'dark') {
        return 'dark';
    }

    return systemPrefersDark ? 'dark' : 'light';
}
