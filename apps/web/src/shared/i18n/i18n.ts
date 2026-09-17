import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Locale } from '@balance/contracts/users';
import en from './locales/en.json';
import ru from './locales/ru.json';

/** `localStorage` key for the last known UI locale. */
export const LOCALE_STORAGE_KEY = 'balance.locale';

const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'ru'];

/** Type guard for locale values from storage or API payloads. */
export function isLocale(value: unknown): value is Locale {
    return value === 'en' || value === 'ru';
}

/** Reads the cached locale, then deploy default. */
export function readCachedLocale(): Locale {
    try {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

        if (isLocale(stored)) {
            return stored;
        }
    } catch {
        // Private mode or blocked storage.
    }

    return 'en';
}

/** Persists the locale for offline / first-paint continuity. */
export function persistLocale(locale: Locale): void {
    try {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
        // Private mode or blocked storage: keep the in-memory locale.
    }

    document.documentElement.lang = locale;
}

/**
 * Initializes i18next once for the app shell.
 * Call before rendering; safe to invoke only from the app entry/provider.
 */
export function initI18n(locale: Locale = readCachedLocale()): typeof i18n {
    if (i18n.isInitialized) {
        i18n.changeLanguage(locale);
        document.documentElement.lang = locale;

        return i18n;
    }

    i18n.use(initReactI18next).init({
        resources: {
            en: { translation: en },
            ru: { translation: ru },
        },
        lng: locale,
        fallbackLng: 'en',
        supportedLngs: [...SUPPORTED_LOCALES],
        interpolation: { escapeValue: false },
    });

    document.documentElement.lang = locale;

    return i18n;
}

/** Applies an active locale to i18next and the document language. */
export async function applyLocale(locale: Locale): Promise<void> {
    persistLocale(locale);
    await i18n.changeLanguage(locale);
}
