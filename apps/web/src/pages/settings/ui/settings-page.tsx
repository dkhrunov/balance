import { useEffect, useState } from 'react';
import { ToastNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../../../shared/preferences';
import { PageShell } from '../../../shared/ui/page';
import { CategoriesSection } from './categories-section';
import { LocaleSection } from './locale-section';
import { ThemeSection } from './theme-section';

export function SettingsPage() {
    const { t } = useTranslation();
    const { error } = usePreferences();
    const [toastOpen, setToastOpen] = useState(false);

    useEffect(() => {
        if (error) {
            setToastOpen(true);
        }
    }, [error]);

    return (
        <PageShell title={t('settings.title')}>
            {error && toastOpen ? (
                <ToastNotification
                    kind="error"
                    title={t('settings.saveError')}
                    lowContrast
                    timeout={5000}
                    onClose={() => {
                        setToastOpen(false);
                    }}
                />
            ) : null}

            <LocaleSection />
            <ThemeSection />
            <CategoriesSection />
        </PageShell>
    );
}
