import { Locale, Theme } from '@balance/contracts/users';
import { useTranslation } from 'react-i18next';

/** Dropdown item for locale selection. */
export type LocaleItem = { id: Locale; text: string };

/** Dropdown item for theme preference selection. */
export type ThemeItem = { id: Theme; text: string };

/**
 * Locale dropdown items.
 */
export function useLocaleItems(): LocaleItem[] {
    const { t } = useTranslation();
    return [
        { id: 'en', text: t('settings.localeEn') },
        { id: 'ru', text: t('settings.localeRu') },
    ];
}

/**
 * Theme preference dropdown items.
 */
export function useThemeItems(): ThemeItem[] {
    const { t } = useTranslation();
    return [
        { id: 'system', text: t('settings.themeSystem') },
        { id: 'light', text: t('settings.themeLight') },
        { id: 'dark', text: t('settings.themeDark') },
    ];
}
