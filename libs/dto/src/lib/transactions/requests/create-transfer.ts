import { EntityId, IsoDate } from '../../common';
import { CurrencyCode } from '../../currencies';

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
