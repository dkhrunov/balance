import { EntityId, IsoDate } from '../../common';
import { CurrencyCode } from '../../currencies';
import { IncomeExpenseType } from '../models/transaction-type';

/** Body for `POST /transactions` (income or expense). */
export interface CreateTransactionRequest {
    readonly type: IncomeExpenseType;
    readonly accountId: EntityId;
    readonly categoryId: EntityId;
    /** Positive decimal-safe amount; currency must match the account. */
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: IsoDate;
    readonly description?: string;
}
