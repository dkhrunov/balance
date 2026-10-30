import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../shared/routes';
import { AuthGuard } from './auth-guard';
import { Layout } from '../layout';

const LoginPage = lazy(() =>
    import('../../pages/login').then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = lazy(() =>
    import('../../pages/dashboard').then((module) => ({ default: module.DashboardPage })),
);
const SettingsPage = lazy(() =>
    import('../../pages/settings').then((module) => ({ default: module.SettingsPage })),
);
const ProfilePage = lazy(() =>
    import('../../pages/profile').then((module) => ({ default: module.ProfilePage })),
);

function AppLoader() {
    const { t } = useTranslation();

    return <InlineLoading description={t('common.loading')} />;
}

/**
 * App route tree: public login, authenticated shell (layout + pages), fallback home.
 */
export function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<AppLoader />}>
                <Routes>
                    <Route path={ROUTES.login} element={<LoginPage />} />
                    <Route element={<AuthGuard />}>
                        <Route element={<Layout />}>
                            <Route path={ROUTES.home} element={<DashboardPage />} />
                            <Route path={ROUTES.settings} element={<SettingsPage />} />
                            <Route path={ROUTES.profile} element={<ProfilePage />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
