import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { InlineLoading } from '@carbon/react';
import { useAuth } from '../shared/auth';

/**
 * Route guard for authenticated app shell routes.
 * Redirects unauthenticated users to `/login`; shows loading while session is resolved.
 */
export function AuthGuard() {
    const { status } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <InlineLoading description="Checking session…" />;
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
