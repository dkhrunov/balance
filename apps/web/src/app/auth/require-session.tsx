import { Navigate, Outlet } from 'react-router-dom';
import { useMockSession } from '../auth/mock-session';

export function RequireSession() {
    const { authenticated } = useMockSession();

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Outlet />
    );
}
