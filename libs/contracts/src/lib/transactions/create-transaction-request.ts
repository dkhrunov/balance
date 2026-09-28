import { EntityId, IsoDate } from '../common';
import { CurrencyCode } from '../currencies';
import { SimpleTransactionType } from './transaction-type';

/** Maximum length of an optional transaction description. */
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 64;

/** Body for `POST /transactions` (income or expense). */
export interface CreateTransactionRequest {
    readonly type: SimpleTransactionType;
    readonly accountId: EntityId;
    readonly categoryId: EntityId;
    /** Positive decimal-safe amount; currency must match the account. */
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: IsoDate;
    readonly description?: string;
}
