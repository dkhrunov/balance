import { HeaderGlobalAction } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './header-locale-actions.module.scss';
import { usePreferences } from '../../../../shared/preferences';


/**
 * Header locale control (EN / RU) using Carbon UI Shell {@link HeaderGlobalAction}.
 * Private to the app layout (not re-exported from the layout barrel).
 */
export function HeaderLocaleActions() {
    const { t } = useTranslation();
    const { locale, setLocale } = usePreferences();


    return (
        <div className={styles.group} role="group" aria-label={t('locale.language')}>
            <HeaderGlobalAction
                aria-label={t('locale.localeEn')}
                isActive={locale === 'en'}
                onClick={() => setLocale('en')}
            >
                <span className={styles.localeLabel}>EN</span>
            </HeaderGlobalAction>
            <HeaderGlobalAction
                aria-label={t('locale.localeRu')}
                isActive={locale === 'ru'}
                onClick={() => setLocale('ru')}
            >
                <span className={styles.localeLabel}>RU</span>
            </HeaderGlobalAction>
        </div>
    );
}
