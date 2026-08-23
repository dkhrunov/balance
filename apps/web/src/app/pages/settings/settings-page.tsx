import { Button, Column, Dropdown, Grid, OnChangeData, Stack } from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import styles from '../page.module.scss';
import { isThemePreference, useThemePreference } from '../../theme/theme-preference';

const localeItems = [
    { id: 'en', text: 'English' },
    { id: 'ru', text: 'Русский' },
];

const themeItems = [
    { id: 'system', text: 'System' },
    { id: 'light', text: 'Light' },
    { id: 'dark', text: 'Dark' },
];

export function SettingsPage() {
    const { preference, setPreference } = useThemePreference();

    const onChangeTheme = ({ selectedItem }: OnChangeData<(typeof themeItems)[number]>) => {
        if (isThemePreference(selectedItem?.id)) {
            setPreference(selectedItem.id);
        }
    };

    return (
        <>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Settings</h2>
                    <p className={styles.subtitle}>Language, theme, and session.</p>
                </div>
            </header>

            <Grid>
                <Column
                    sm={breakpoints.sm.columns}
                    md={breakpoints.md.columns / 2}
                    lg={breakpoints.lg.columns / 3}
                >
                    <Stack gap={4}>
                        <Dropdown
                            id="settings-locale"
                            titleText="Language"
                            label="Choose language"
                            items={localeItems}
                            itemToString={(item) => (item ? item.text : '')}
                            initialSelectedItem={localeItems[0]}
                        />
                        <Dropdown
                            id="settings-theme"
                            titleText="Theme"
                            label="Choose theme"
                            items={themeItems}
                            itemToString={(item) => (item ? item.text : '')}
                            initialSelectedItem={themeItems.find((item) => item.id === preference)}
                            onChange={onChangeTheme}
                        />
                        <Button kind="tertiary" disabled>
                            Sync now (prototype)
                        </Button>
                    </Stack>
                </Column>
            </Grid>
        </>
    );
}
