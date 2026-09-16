import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthGuard } from './auth-guard';

const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }));

vi.mock('../shared/auth', () => ({ useAuth }));

describe('AuthGuard', () => {
    it('redirects unauthenticated users to login', () => {
        useAuth.mockReturnValue({ status: 'unauthenticated' });

        render(
            <MemoryRouter initialEntries={['/transactions']}>
                <Routes>
                    <Route element={<AuthGuard />}>
                        <Route path="/transactions" element={<p>Transactions</p>} />
                    </Route>
                    <Route path="/login" element={<p>Login</p>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('renders nested routes for authenticated users', () => {
        useAuth.mockReturnValue({ status: 'authenticated' });

        render(
            <MemoryRouter initialEntries={['/transactions']}>
                <Routes>
                    <Route element={<AuthGuard />}>
                        <Route path="/transactions" element={<p>Transactions</p>} />
                    </Route>
                    <Route path="/login" element={<p>Login</p>} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
});
