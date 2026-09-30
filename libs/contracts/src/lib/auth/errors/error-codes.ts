/** Stable authentication error codes consumed by API clients. */
export const AUTH_ERROR_CODES = {
    invalidCredentials: 'AUTH_INVALID_CREDENTIALS',
    unauthenticated: 'AUTH_UNAUTHENTICATED',
    invalidRequest: 'AUTH_INVALID_REQUEST',
    csrfRejected: 'AUTH_CSRF_REJECTED',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
