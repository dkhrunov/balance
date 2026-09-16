import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { InlineLoading } from '@carbon/react';
import { AuthProvider } from '../shared/auth';
import { ThemePreferenceProvider } from '../shared/theme';
import { AuthGuard } from './auth-guard';
import { Layout } from './layout';

const LoginPage = lazy(() =>
    import('../pages/login').then((module) => ({ default: module.LoginPage })),
);
const TransactionsPage = lazy(() =>
    import('../pages/transactions').then((module) => ({ default: module.TransactionsPage })),
);
const AccountsPage = lazy(() =>
    import('../pages/accounts').then((module) => ({ default: module.AccountsPage })),
);
const CategoriesPage = lazy(() =>
    import('../pages/categories').then((module) => ({ default: module.CategoriesPage })),
);
const SettingsPage = lazy(() =>
    import('../pages/settings').then((module) => ({ default: module.SettingsPage })),
);
const ProfilePage = lazy(() =>
    import('../pages/profile').then((module) => ({ default: module.ProfilePage })),
);

const Loader = <InlineLoading description="Loading…" />;

export function App() {
    return (
        <ThemePreferenceProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Suspense fallback={Loader}>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route element={<AuthGuard />}>
                                <Route element={<Layout />}>
                                    <Route path="/transactions" element={<TransactionsPage />} />
                                    <Route path="/accounts" element={<AccountsPage />} />
                                    <Route path="/categories" element={<CategoriesPage />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                </Route>
                            </Route>
                            <Route path="/" element={<Navigate to="/transactions" replace />} />
                            <Route path="*" element={<Navigate to="/transactions" replace />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </ThemePreferenceProvider>
    );
}

export default App;
