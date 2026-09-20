/** Stable account API error codes consumed by clients. */
export const ACCOUNT_ERROR_CODES = {
    notFound: 'ACCOUNT_NOT_FOUND',
    versionConflict: 'ACCOUNT_VERSION_CONFLICT',
    validationFailed: 'ACCOUNT_VALIDATION_FAILED',
} as const;

export type AccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[keyof typeof ACCOUNT_ERROR_CODES];
