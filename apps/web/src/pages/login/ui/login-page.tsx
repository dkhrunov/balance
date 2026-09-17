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
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            setError(t('login.enterCredentials'));
            return;
        }

        setIsSubmitting(true);

        try {
            await login({ email, password });
            setPassword('');
        } catch (reason) {
            setError(getLoginError(reason, t));
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
                        <h1 className={styles.title}>{t('common.appName')}</h1>
                        <p className={styles.subtitle}>{t('login.subtitle')}</p>
                    </header>

                    <form onSubmit={onSubmit} noValidate>
                        <Stack gap={6}>
                            {error ? (
                                <InlineNotification
                                    kind="error"
                                    title={t('login.cannotSignIn')}
                                    subtitle={error}
                                    lowContrast
                                    hideCloseButton
                                />
                            ) : null}
                            <TextInput
                                id="login-email"
                                labelText={t('login.email')}
                                autoComplete="username"
                                value={email}
                                disabled={isSubmitting}
                                onChange={onChangeEmail}
                            />
                            <PasswordInput
                                id="login-password"
                                labelText={t('login.password')}
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
                                            description={t('login.submitting')}
                                        />
                                    ) : (
                                        t('login.submit')
                                    )}
                                </Button>
                            </ButtonSet>
                            <p className={styles.hint}>{t('login.hint')}</p>
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

function getLoginError(reason: unknown, t: (key: string) => string): string {
    if (reason instanceof ApiError && reason.code === 'AUTH_INVALID_CREDENTIALS') {
        return t('login.invalidCredentials');
    }

    return t('login.genericError');
}
