import { CurrencyCode } from '../currencies';

/** Body for `POST /accounts`. */
export interface CreateAccountRequest {
    readonly name: string;
    readonly currency: CurrencyCode;
    /** Decimal-safe amount in {@link currency}. */
    readonly initialBalance: string;
}
