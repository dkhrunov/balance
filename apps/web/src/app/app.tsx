import { AccountsProvider } from '../entities/account';
import { CategoriesProvider } from '../entities/category';
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
                        <CategoriesProvider>
                            <AppRouter />
                        </CategoriesProvider>
                    </AccountsProvider>
                </PreferencesProvider>
            </AuthProvider>
        </I18nProvider>
    );
}

export default App;
