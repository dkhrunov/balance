/** Stable category API error codes consumed by clients. */
export const CATEGORY_ERROR_CODES = {
    notFound: 'CATEGORY_NOT_FOUND',
    versionConflict: 'CATEGORY_VERSION_CONFLICT',
    validationFailed: 'CATEGORY_VALIDATION_FAILED',
} as const;

export type CategoryErrorCode = (typeof CATEGORY_ERROR_CODES)[keyof typeof CATEGORY_ERROR_CODES];
