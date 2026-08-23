import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MockSessionProvider } from './auth/mock-session';
import { RequireSession } from './auth/require-session';
import { LoginPage } from './pages/login/login-page';
import { TransactionsPage } from './pages/transactions/transactions-page';
import { AccountsPage } from './pages/accounts/accounts-page';
import { CategoriesPage } from './pages/categories/categories-page';
import { SettingsPage } from './pages/settings/settings-page';
import { ProfilePage } from './pages/profile/profile-page';
import { Layout } from './layout/layout';
import { ThemePreferenceProvider } from './theme/theme-preference';

export function App() {
    return (
        <ThemePreferenceProvider>
            <MockSessionProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<RequireSession />}>
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
                </BrowserRouter>
            </MockSessionProvider>
        </ThemePreferenceProvider>
    );
}

export default App;
