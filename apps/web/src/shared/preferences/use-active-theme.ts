import { useEffect, useState } from 'react';
import { ActiveTheme, resolveActiveTheme } from '../theme';
import { usePreferences } from './preferences-provider';

function readSystemPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Returns the theme currently in effect for UI that needs a concrete light/dark choice.
 * When preference is `system`, follows `prefers-color-scheme` and updates on OS changes.
 * Requires {@link PreferencesProvider}.
 */
export function useActiveTheme(): ActiveTheme {
    const { theme } = usePreferences();
    const [systemPrefersDark, setSystemPrefersDark] = useState(readSystemPrefersDark);

    useEffect(() => {
        if (theme !== 'system') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setSystemPrefersDark(media.matches);

        onChange();
        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, [theme]);

    return resolveActiveTheme(theme, systemPrefersDark);
}
