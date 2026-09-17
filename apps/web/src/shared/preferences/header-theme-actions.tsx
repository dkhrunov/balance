import { IconButton } from '@carbon/react';
import { Asleep, Devices, Light } from '@carbon/react/icons';
import { Theme } from '@balance/contracts/users';
import { useTranslation } from 'react-i18next';
import styles from './header-preference-actions.module.scss';

const TOOLTIP_ENTER_DELAY_MS = 400;

type HeaderThemeActionsProps = {
    /** Currently selected theme preference. */
    readonly theme: Theme;
    /** Persists the chosen theme preference. */
    readonly onChange: (theme: Theme) => void;
};

/**
 * Borderless header theme control using Carbon IconButton ghost icons.
 */
export function HeaderThemeActions({ theme, onChange }: HeaderThemeActionsProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.group} role="group" aria-label={t('settings.theme')}>
            <IconButton
                kind="ghost"
                size="lg"
                label={t('settings.themeSystem')}
                align="bottom"
                enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                isSelected={theme === 'system'}
                onClick={() => onChange('system')}
            >
                <Devices />
            </IconButton>
            <IconButton
                kind="ghost"
                size="lg"
                label={t('settings.themeLight')}
                align="bottom"
                enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                isSelected={theme === 'light'}
                onClick={() => onChange('light')}
            >
                <Light />
            </IconButton>
            <IconButton
                kind="ghost"
                size="lg"
                label={t('settings.themeDark')}
                align="bottom"
                enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                isSelected={theme === 'dark'}
                onClick={() => onChange('dark')}
            >
                <Asleep />
            </IconButton>
        </div>
    );
}
