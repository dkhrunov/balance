import { Column, Grid, InlineNotification, Stack } from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import { useTranslation } from 'react-i18next';
import {
    LocaleSwitcher,
    ThemeSwitcher,
    usePreferences,
} from '../../../shared/preferences';
import { PageShell } from '../../../shared/ui/page';

export function SettingsPage() {
    const { t } = useTranslation();
    const { locale, theme, setLocale, setTheme, error, isSyncing } = usePreferences();

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
                        <LocaleSwitcher
                            id="settings-locale"
                            locale={locale}
                            onChange={setLocale}
                            disabled={isSyncing}
                            size="md"
                            showLabel
                        />
                        <ThemeSwitcher
                            id="settings-theme"
                            theme={theme}
                            onChange={setTheme}
                            disabled={isSyncing}
                            size="md"
                            showLabel
                        />
                    </Stack>
                </Column>
            </Grid>
        </PageShell>
    );
}
