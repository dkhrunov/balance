import { ContentSwitcher, FormLabel, IconSwitch } from '@carbon/react';
import { Asleep, Devices, Light } from '@carbon/react/icons';
import { Theme } from '@balance/dto/users';
import { useTranslation } from 'react-i18next';
import { isTheme } from '../../../../../shared/theme';
import styles from './theme-switcher.module.scss';

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
 * Private to the settings theme section.
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
        system: t('theme.themeSystem'),
        light: t('theme.themeLight'),
        dark: t('theme.themeDark'),
    };

    return (
        <div className={styles.root} data-ascii="surface">
            {showLabel ? (
                <FormLabel id={`${id}-label`} className={styles.label}>
                    {t('theme.title')}
                </FormLabel>
            ) : null}
            <ContentSwitcher
                aria-labelledby={showLabel ? `${id}-label` : undefined}
                aria-label={showLabel ? undefined : t('theme.title')}
                size={size}
                selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                onChange={({ name }) => {
                    if (isTheme(name)) {
                        onChange(name);
                    }
                }}
                data-ascii="fade"
            >
                <IconSwitch
                    name="system"
                    text={labels.system}
                    disabled={disabled}
                    align="bottom"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                    data-ascii="media"
                >
                    <Devices />
                </IconSwitch>
                <IconSwitch
                    name="light"
                    text={labels.light}
                    disabled={disabled}
                    align="bottom"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                    data-ascii="media"
                >
                    <Light />
                </IconSwitch>
                <IconSwitch
                    name="dark"
                    text={labels.dark}
                    disabled={disabled}
                    align="bottom"
                    enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                    data-ascii="media"
                >
                    <Asleep />
                </IconSwitch>
            </ContentSwitcher>
        </div>
    );
}
