import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

const STORAGE_KEY = 'balance.mockSession';

type MockSession = {
    authenticated: boolean;
    login: () => void;
    logout: () => void;
};

const MockSessionContext = createContext<MockSession | null>(null);

function readInitialAuth(): boolean {
    try {
        return sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

export function MockSessionProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState(readInitialAuth);

    const login = useCallback(() => {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(STORAGE_KEY);
        setAuthenticated(false);
    }, []);

    const value = useMemo(
        () => ({ authenticated, login, logout }),
        [authenticated, login, logout],
    );

    return (
        <MockSessionContext.Provider value={value}>{children}</MockSessionContext.Provider>
    );
}

export function useMockSession(): MockSession {
    const context = useContext(MockSessionContext);

    if (!context) {
        throw new Error('useMockSession must be used within MockSessionProvider');
    }

    return context;
}
