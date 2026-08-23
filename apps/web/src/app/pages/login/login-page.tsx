import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    Button,
    ButtonSet,
    Column,
    Grid,
    InlineNotification,
    PasswordInput,
    Stack,
    TextInput,
} from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import { useMockSession } from '../../auth/mock-session';
import styles from './login-page.module.scss';

const SM_COLUMN = breakpoints.sm.columns;
const LOGIN_MD_SPAN = breakpoints.md.columns / 2;
const LOGIN_MD_OFFSET = breakpoints.md.columns / 4;
const MD_COLUMN = { span: LOGIN_MD_SPAN, offset: LOGIN_MD_OFFSET };
const LOGIN_LG_SPAN = breakpoints.lg.columns / 4;
const LOGIN_LG_OFFSET = (breakpoints.lg.columns - LOGIN_LG_SPAN) / 2;
const LG_COLUMN = { span: LOGIN_LG_SPAN, offset: LOGIN_LG_OFFSET };

export function LoginPage() {
    const { authenticated, login } = useMockSession();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (authenticated) {
        return <Navigate to="/transactions" replace />;
    }

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!username.trim() || !password) {
            setError('Enter username and password.');
            return;
        }

        // Layout prototype: any non-empty credentials enter the shell.
        login();
        navigate('/transactions', { replace: true });
    };

    return (
        <div className={styles.page}>
            <Grid>
                <Column
                    sm={SM_COLUMN}
                    md={MD_COLUMN}
                    lg={LG_COLUMN}
                >
                    <header className={styles.brand}>
                        <h1 className={styles.title}>Balance</h1>
                        <p className={styles.subtitle}>Sign in to your finance space.</p>
                    </header>

                    <form onSubmit={onSubmit} noValidate>
                        <Stack gap={6}>
                            {error ? (
                                <InlineNotification
                                    kind="error"
                                    title="Cannot sign in"
                                    subtitle={error}
                                    lowContrast
                                    hideCloseButton
                                />
                            ) : null}
                            <TextInput
                                id="login-username"
                                labelText="Username"
                                autoComplete="username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                            <PasswordInput
                                id="login-password"
                                labelText="Password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <ButtonSet fluid>
                                <Button type="submit" kind="primary" className={styles.submit}>
                                    Log in
                                </Button>
                            </ButtonSet>
                            <p className={styles.hint}>
                                Accounts are created by an admin. This screen is a layout
                                prototype — any non-empty credentials open the app shell.
                            </p>
                        </Stack>
                    </form>
                </Column>
            </Grid>
        </div>
    );
}
