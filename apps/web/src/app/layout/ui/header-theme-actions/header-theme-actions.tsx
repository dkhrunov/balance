import { HeaderGlobalAction } from '@carbon/react';
import { Asleep, Devices, Light } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import styles from './header-theme-actions.module.scss';
import { usePreferences } from '../../../../shared/preferences';

/**
 * Header theme control using Carbon UI Shell {@link HeaderGlobalAction}.
 * Private to the app layout (not re-exported from the layout barrel).
 */
export function HeaderThemeActions() {
    const { t } = useTranslation();
    const { theme, setTheme } = usePreferences();


    return (
        <div className={styles.group} role="group" aria-label={t('theme.title')}>
            <HeaderGlobalAction
                aria-label={t('theme.themeSystem')}
                isActive={theme === 'system'}
                onClick={() => setTheme('system')}
            >
                <Devices size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
                aria-label={t('theme.themeLight')}
                isActive={theme === 'light'}
                onClick={() => setTheme('light')}
            >
                <Light size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
                aria-label={t('theme.themeDark')}
                isActive={theme === 'dark'}
                onClick={() => setTheme('dark')}
            >
                <Asleep size={20} />
            </HeaderGlobalAction>
        </div>
    );
}
