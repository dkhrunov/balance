import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { I18nProvider } from '../shared/i18n';
import { AuthGuard } from './auth-guard';

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock('../shared/auth', () => ({ useAuth }));

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <I18nProvider>
            <MemoryRouter initialEntries={['/']}>{ui}</MemoryRouter>
        </I18nProvider>,
    );
}

describe('AuthGuard', () => {
    it('redirects unauthenticated users to login', () => {
        useAuth.mockReturnValue({ status: 'unauthenticated' });

        renderWithProviders(
            <Routes>
                <Route element={<AuthGuard />}>
                    <Route path="/" element={<p>Dashboard</p>} />
                </Route>
                <Route path="/login" element={<p>Login</p>} />
            </Routes>,
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('renders nested routes for authenticated users', () => {
        useAuth.mockReturnValue({ status: 'authenticated' });

        renderWithProviders(
            <Routes>
                <Route element={<AuthGuard />}>
                    <Route path="/" element={<p>Dashboard</p>} />
                </Route>
                <Route path="/login" element={<p>Login</p>} />
            </Routes>,
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
});
