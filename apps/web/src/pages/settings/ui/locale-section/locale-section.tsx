import { useTranslation } from 'react-i18next';
import { usePreferences } from '../../../../shared/preferences';
import { LocaleSwitcher } from './locale-switcher';
import styles from './locale-section.module.scss';

export function LocaleSection() {
    const { t } = useTranslation();
    const { locale, setLocale, isSyncing } = usePreferences();

    return (
        <section className={styles.section} aria-labelledby="settings-locale-heading">
            <h4 id="settings-locale-heading" className={styles.title}>
                {t('locale.title')}
            </h4>

            <LocaleSwitcher
                id="settings-locale"
                locale={locale}
                onChange={setLocale}
                disabled={isSyncing}
                size="md"
                showLabel
            />
        </section>
    );
}
