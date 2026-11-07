/**
 * Whether Postgres rejected a write because the currency code is not in `currencies`.
 *
 * @param error Error thrown by `pg`.
 */
export function isUnknownCurrencyViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const pgError = error as { code?: unknown; constraint?: unknown };

    return pgError.code === '23503' && typeof pgError.constraint === 'string' && pgError.constraint.includes('currency');
}
