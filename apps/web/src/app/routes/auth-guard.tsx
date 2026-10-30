import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../shared/auth';
import { ROUTES } from '../../shared/routes';

/**
 * Route guard for authenticated app shell routes.
 * Redirects unauthenticated users to {@link ROUTES.login}; shows loading while session is resolved.
 */
export function AuthGuard() {
    const { status } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    if (status === 'loading') {
        return <InlineLoading description={t('common.loading')} />;
    }

    if (status === 'unauthenticated') {
        return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
    }

    return <Outlet />;
}
