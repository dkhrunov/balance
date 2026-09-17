import { ContentSwitcher, FormLabel, IconSwitch } from '@carbon/react';
import { Asleep, Devices, Light } from '@carbon/react/icons';
import { Theme } from '@balance/contracts/users';
import { useTranslation } from 'react-i18next';
import { isTheme } from '../theme';
import styles from './preference-switcher.module.scss';

const THEME_OPTIONS = ['system', 'light', 'dark'] as const satisfies readonly Theme[];

/** Delay before showing the icon tooltip on hover. */
const TOOLTIP_ENTER_DELAY_MS = 400;

type ThemeSwitcherProps = {
    /** Currently selected theme preference. */
    readonly theme: Theme;
    /** Persists the chosen theme preference. */
    readonly onChange: (theme: Theme) => void;
    /** Disables all switch options while preferences sync. */
    readonly disabled?: boolean;
    /** Visual size of the Carbon ContentSwitcher. */
    readonly size?: 'sm' | 'md' | 'lg';
    /** When true, renders a visible form label above the switcher. */
    readonly showLabel?: boolean;
    /** Optional id used to associate the label with the switcher. */
    readonly id?: string;
};

/**
 * Compact theme preference control (system / light / dark), Carbon ContentSwitcher + icons.
 */
export function ThemeSwitcher({
    theme,
    onChange,
    disabled = false,
    size = 'sm',
    showLabel = false,
    id = 'theme-switcher',
}: ThemeSwitcherProps) {
    const { t } = useTranslation();
    const selectedIndex = THEME_OPTIONS.indexOf(theme);

    const labels: Record<Theme, string> = {
        system: t('settings.themeSystem'),
        light: t('settings.themeLight'),
        dark: t('settings.themeDark'),
    };

    return (
        <div className={styles.root}>
            {showLabel ? (
                <FormLabel id={`${id}-label`} className={styles.label}>
                    {t('settings.theme')}
                </FormLabel>
            ) : null}
            <ContentSwitcher
                aria-labelledby={showLabel ? `${id}-label` : undefined}
                aria-label={showLabel ? undefined : t('settings.theme')}
                size={size}
                selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                onChange={({ name }) => {
                    if (isTheme(name)) {
                        onChange(name);
                    }
                }}
            >
                <IconSwitch
                    name="system"
                    text={labels.system}
                    disabled={disabled}
                    align="bottom"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                >
                    <Devices />
                </IconSwitch>
                <IconSwitch
                    name="light"
                    text={labels.light}
                    disabled={disabled}
                    align="bottom"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                >
                    <Light />
                </IconSwitch>
                <IconSwitch
                    name="dark"
                    text={labels.dark}
                    disabled={disabled}
                    align="bottom"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                >
                    <Asleep />
                </IconSwitch>
            </ContentSwitcher>
        </div>
    );
}
