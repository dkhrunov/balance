import { Button, Column, Dropdown, Grid, InlineNotification, OnChangeData, Stack } from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import { useTranslation } from 'react-i18next';
import { isLocale } from '../../../shared/i18n';
import {
    LocaleItem,
    ThemeItem,
    useLocaleItems,
    usePreferences,
    useThemeItems,
} from '../../../shared/preferences';
import { isTheme } from '../../../shared/theme';
import { PageShell } from '../../../shared/ui/page';

export function SettingsPage() {
    const { t } = useTranslation();
    const { locale, theme, setLocale, setTheme, error, isSyncing } = usePreferences();
    const localeItems = useLocaleItems();
    const themeItems = useThemeItems();


    const onChangeLocale = ({ selectedItem }: OnChangeData<LocaleItem>) => {
        if (isLocale(selectedItem?.id)) {
            setLocale(selectedItem.id);
        }
    };

    const onChangeTheme = ({ selectedItem }: OnChangeData<ThemeItem>) => {
        if (isTheme(selectedItem?.id)) {
            setTheme(selectedItem.id);
        }
    };

    return (
        <PageShell title={t('settings.title')} subtitle={t('settings.subtitle')}>
            <Grid>
                <Column
                    sm={breakpoints.sm.columns}
                    md={breakpoints.md.columns / 2}
                    lg={breakpoints.lg.columns / 4}
                >
                    <Stack gap={4}>
                        {error ? (
                            <InlineNotification
                                kind="error"
                                title={t('settings.saveError')}
                                lowContrast
                                hideCloseButton
                            />
                        ) : null}
                        <Dropdown
                            id="settings-locale"
                            titleText={t('settings.language')}
                            label={t('settings.languagePlaceholder')}
                            items={localeItems}
                            itemToString={(item) => (item ? item.text : '')}
                            selectedItem={localeItems.find((item) => item.id === locale)}
                            onChange={onChangeLocale}
                            disabled={isSyncing}
                        />
                        <Dropdown
                            id="settings-theme"
                            titleText={t('settings.theme')}
                            label={t('settings.themePlaceholder')}
                            items={themeItems}
                            itemToString={(item) => (item ? item.text : '')}
                            selectedItem={themeItems.find((item) => item.id === theme)}
                            onChange={onChangeTheme}
                            disabled={isSyncing}
                        />
                        <Button kind="tertiary" disabled>
                            {t('settings.syncNow')}
                        </Button>
                    </Stack>
                </Column>
            </Grid>
        </PageShell>
    );
}
