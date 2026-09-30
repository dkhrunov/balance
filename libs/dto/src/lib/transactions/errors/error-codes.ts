/** Stable transaction API error codes consumed by clients. */
export const TRANSACTION_ERROR_CODES = {
    notFound: 'TRANSACTION_NOT_FOUND',
    versionConflict: 'TRANSACTION_VERSION_CONFLICT',
    validationFailed: 'TRANSACTION_VALIDATION_FAILED',
    categoryTypeMismatch: 'TRANSACTION_CATEGORY_TYPE_MISMATCH',
    currencyMismatch: 'TRANSACTION_CURRENCY_MISMATCH',
    sameAccount: 'TRANSACTION_TRANSFER_SAME_ACCOUNT',
} as const;

export type TransactionErrorCode = (typeof TRANSACTION_ERROR_CODES)[keyof typeof TRANSACTION_ERROR_CODES];
