import { useTranslation } from 'react-i18next';
import { usePreferences } from '../../../../shared/preferences';
import { ThemeSwitcher } from './theme-switcher';
import styles from './theme-section.module.scss';

export function ThemeSection() {
    const { t } = useTranslation();
    const { theme, setTheme, isSyncing } = usePreferences();

    return (
        <section className={styles.section} aria-labelledby="settings-theme-heading">
            <h4 id="settings-theme-heading" className={styles.title}>
                {t('theme.title')}
            </h4>

            <ThemeSwitcher
                id="settings-theme"
                theme={theme}
                onChange={setTheme}
                disabled={isSyncing}
                size="md"
                showLabel
            />
        </section>
    );
}
