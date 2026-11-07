/** Raised when a currency code is well-formed but absent from currencies. */
export class UnknownCurrencyError extends Error {
    public constructor(public readonly currency: string) {
        super(`Unknown currency: ${currency}`);
        this.name = 'UnknownCurrencyError';
    }
}
