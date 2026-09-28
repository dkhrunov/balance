import { EntityId, IsoDate } from '../common';
import { CurrencyCode } from '../currencies';
import { TRANSACTION_DESCRIPTION_MAX_LENGTH } from './create-transaction-request';
import { Transaction } from './transaction';

export { TRANSACTION_DESCRIPTION_MAX_LENGTH };

/**
 * Body for `POST /transactions/transfers`.
 * Both accounts must share {@link currency}; no FX conversion in MVP.
 */
export interface CreateTransferRequest {
    readonly fromAccountId: EntityId;
    readonly toAccountId: EntityId;
    /** Positive decimal-safe amount; currency must match both accounts. */
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: IsoDate;
    readonly description?: string;
}

/** Both legs of an atomic transfer sharing one `transferGroupId`. */
export interface CreateTransferResponse {
    readonly transferGroupId: EntityId;
    readonly out: Transaction;
    readonly in: Transaction;
}
