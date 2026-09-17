import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from './i18n';

const i18nInstance = initI18n();

/** Provides react-i18next context for the app shell. */
export function I18nProvider({ children }: { children: ReactNode }) {
    return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
