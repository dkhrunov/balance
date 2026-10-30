import { useTranslation } from 'react-i18next';
import { PageShell } from '../../../shared/ui/page';

/**
 * Authenticated home. Feature sections land in follow-up commits.
 */
export function DashboardPage() {
    const { t } = useTranslation();

    return <PageShell title={t('dashboard.title')} />;
}
