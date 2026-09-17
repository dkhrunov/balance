import { IconButton } from '@carbon/react';
import { Locale } from '@balance/contracts/users';
import { useTranslation } from 'react-i18next';
import styles from './header-preference-actions.module.scss';

const TOOLTIP_ENTER_DELAY_MS = 400;

type HeaderLocaleActionsProps = {
    /** Currently selected locale preference. */
    readonly locale: Locale;
    /** Persists the chosen locale preference. */
    readonly onChange: (locale: Locale) => void;
};

/**
 * Borderless header locale control (EN / RU) using Carbon IconButton ghost.
 */
export function HeaderLocaleActions({ locale, onChange }: HeaderLocaleActionsProps) {
    const { t } = useTranslation();

    return (
        <div className={styles.group} role="group" aria-label={t('settings.language')}>
            <IconButton
                kind="ghost"
                size="lg"
                label={t('settings.localeEn')}
                align="bottom"
                enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                isSelected={locale === 'en'}
                onClick={() => onChange('en')}
            >
                <span className={styles.localeLabel}>EN</span>
            </IconButton>
            <IconButton
                kind="ghost"
                size="lg"
                label={t('settings.localeRu')}
                align="bottom"
                enterDelayMs={TOOLTIP_ENTER_DELAY_MS}
                isSelected={locale === 'ru'}
                onClick={() => onChange('ru')}
            >
                <span className={styles.localeLabel}>RU</span>
            </IconButton>
        </div>
    );
}
