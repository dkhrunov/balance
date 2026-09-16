import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react';
import { LoginRequest } from '@balance/contracts/auth';
import { UserIdentity } from '@balance/contracts/users';
import { noopSessionExpiredHandler, registerSessionExpiredHandler } from '../api';
import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
} from './auth-client';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const AuthContext = createContext<IAuth | null>(null);

let pendingSessionRestore: Promise<UserIdentity | null> | null = null;

function restoreSession(): Promise<UserIdentity | null> {
    if (pendingSessionRestore) {
        return pendingSessionRestore;
    }

    pendingSessionRestore = getCurrentUser()
        .then((response) => response.user)
        .catch(() => null)
        .finally(() => {
            pendingSessionRestore = null;
        });

    return pendingSessionRestore;
}

export interface IAuth {
    readonly status: AuthStatus;
    readonly user: UserIdentity | null;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [user, setUser] = useState<UserIdentity | null>(null);

    useEffect(() => {
        registerSessionExpiredHandler(() => {
            setUser(null);
            setStatus('unauthenticated');
        });

        return () => registerSessionExpiredHandler(noopSessionExpiredHandler);
    }, []);

    useEffect(() => {
        let cancelled = false;

        void restoreSession().then((restoredUser) => {
            if (cancelled) {
                return;
            }

            setUser(restoredUser);
            setStatus(restoredUser ? 'authenticated' : 'unauthenticated');
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
        const response = await loginRequest(credentials);
        setUser(response.user);
        setStatus('authenticated');
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await logoutRequest();
        } finally {
            setUser(null);
            setStatus('unauthenticated');
        }
    }, []);

    const value = useMemo(
        () => ({ status, user, login, logout }),
        [status, user, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuth {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
