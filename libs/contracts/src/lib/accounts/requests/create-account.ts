import { CurrencyCode } from '../../currencies';
import { AccountIcon } from '../models/account-icon';

/** Body for `POST /accounts`. */
export interface CreateAccountRequest {
    readonly name: string;
    readonly currency: CurrencyCode;
    /** Decimal-safe amount in {@link currency}. */
    readonly initialBalance: string;
    /** Optional Carbon icon name; defaults to `Wallet` when omitted. */
    readonly icon?: AccountIcon;
}
