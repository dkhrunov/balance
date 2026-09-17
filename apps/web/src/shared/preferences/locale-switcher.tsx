import { ContentSwitcher, FormLabel, Switch } from '@carbon/react';
import { Locale } from '@balance/contracts/users';
import { useTranslation } from 'react-i18next';
import { isLocale } from '../i18n';
import styles from './preference-switcher.module.scss';

const LOCALE_OPTIONS = ['en', 'ru'] as const satisfies readonly Locale[];

type LocaleSwitcherProps = {
    /** Currently selected locale preference. */
    readonly locale: Locale;
    /** Persists the chosen locale preference. */
    readonly onChange: (locale: Locale) => void;
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
 * Compact locale preference control (EN / RU), Carbon ContentSwitcher.
 */
export function LocaleSwitcher({
    locale,
    onChange,
    disabled = false,
    size = 'sm',
    showLabel = false,
    id = 'locale-switcher',
}: LocaleSwitcherProps) {
    const { t } = useTranslation();
    const selectedIndex = LOCALE_OPTIONS.indexOf(locale);

    return (
        <div className={styles.root}>
            {showLabel ? (
                <FormLabel id={`${id}-label`} className={styles.label}>
                    {t('settings.language')}
                </FormLabel>
            ) : null}
            <div className={styles.textControl}>
                <ContentSwitcher
                    aria-labelledby={showLabel ? `${id}-label` : undefined}
                    aria-label={showLabel ? undefined : t('settings.language')}
                    size={size}
                    selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
                    onChange={({ name }) => {
                        if (isLocale(name)) {
                            onChange(name);
                        }
                    }}
                >
                    <Switch name="en" text="EN" disabled={disabled} />
                    <Switch name="ru" text="RU" disabled={disabled} />
                </ContentSwitcher>
            </div>
        </div>
    );
}
