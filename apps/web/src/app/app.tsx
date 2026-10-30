import { AccountsProvider } from '../entities/account';
import { AuthProvider } from '../shared/auth';
import { I18nProvider } from '../shared/i18n';
import { PreferencesProvider } from '../shared/preferences';
import { AppRouter } from './routes';

/**
 * Root composition: global providers + app router.
 */
export function App() {
    return (
        <I18nProvider>
            <AuthProvider>
                <PreferencesProvider>
                    <AccountsProvider>
                        <AppRouter />
                    </AccountsProvider>
                </PreferencesProvider>
            </AuthProvider>
        </I18nProvider>
    );
}

export default App;
