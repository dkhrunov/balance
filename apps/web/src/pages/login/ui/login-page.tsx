import { ChangeEvent, FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
    Button,
    ButtonSet,
    Column,
    Grid,
    InlineLoading,
    InlineNotification,
    PasswordInput,
    Stack,
    TextInput,
} from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import { ApiError } from '../../../shared/api';
import { useAuth } from '../../../shared/auth';
import styles from './login-page.module.scss';

const SM_COLUMN = breakpoints.sm.columns;
const LOGIN_MD_SPAN = breakpoints.md.columns / 2;
const LOGIN_MD_OFFSET = breakpoints.md.columns / 4;
const MD_COLUMN = { span: LOGIN_MD_SPAN, offset: LOGIN_MD_OFFSET };
const LOGIN_LG_SPAN = breakpoints.lg.columns / 4;
const LOGIN_LG_OFFSET = (breakpoints.lg.columns - LOGIN_LG_SPAN) / 2;
const LG_COLUMN = { span: LOGIN_LG_SPAN, offset: LOGIN_LG_OFFSET };


export function LoginPage() {
    const { status, login } = useAuth();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


    if (status === 'authenticated') {
        return <Navigate to={getReturnPath(location.state)} replace />;
    }

    const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setError(null);
    };

    const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
        setError(null);
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!email.trim() || !password) {
            setError('Enter email and password.');
            return;
        }

        setIsSubmitting(true);

        try {
            await login({ email, password });
            setPassword('');
        } catch (reason) {
            setError(getLoginError(reason));
            setPassword('');
        } finally {
            setIsSubmitting(false);
        }
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
                                id="login-email"
                                labelText="Email"
                                autoComplete="username"
                                value={email}
                                disabled={isSubmitting}
                                onChange={onChangeEmail}
                            />
                            <PasswordInput
                                id="login-password"
                                labelText="Password"
                                autoComplete="current-password"
                                value={password}
                                disabled={isSubmitting}
                                onChange={onChangePassword}
                            />
                            <ButtonSet fluid>
                                <Button
                                    type="submit"
                                    kind="primary"
                                    className={`${isSubmitting ? ' cds--btn--loading' : ''}`}
                                    disabled={isSubmitting}
                                    aria-busy={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <InlineLoading
                                            status="active"
                                            description="Logging in..."
                                        />
                                    ) : (
                                        'Log in'
                                    )}
                                </Button>
                            </ButtonSet>
                            <p className={styles.hint}>
                                Accounts are created by an administrator. Use the credentials
                                provided for this financial space.
                            </p>
                        </Stack>
                    </form>
                </Column>
            </Grid>
        </div>
    );
}

function getReturnPath(state: unknown): string {
    if (!isReturnLocation(state)) {
        return '/transactions';
    }

    return `${state.from.pathname}${state.from.search}${state.from.hash}`;
}

function isReturnLocation(value: unknown): value is {
    readonly from: { readonly pathname: string; readonly search: string; readonly hash: string };
} {
    if (typeof value !== 'object' || value === null || !('from' in value)) {
        return false;
    }

    const from = value.from;

    return typeof from === 'object'
        && from !== null
        && 'pathname' in from
        && 'search' in from
        && 'hash' in from
        && typeof from.pathname === 'string'
        && typeof from.search === 'string'
        && typeof from.hash === 'string';
}

function getLoginError(reason: unknown): string {
    if (reason instanceof ApiError && reason.code === 'AUTH_INVALID_CREDENTIALS') {
        return 'Email or password is incorrect.';
    }

    return 'Unable to sign in. Check your connection and try again.';
}
