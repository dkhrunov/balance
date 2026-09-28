import { EntityId, EntityVersion, IsoDate, IsoTimestamp } from '../common';
import { CurrencyCode } from '../currencies';
import { TransactionType } from './transaction-type';

/** Financial operation posted to an account in the single app space. */
export interface Transaction {
    readonly id: EntityId;
    readonly type: TransactionType;
    readonly accountId: EntityId;
    /** Present for income/expense; `null` for transfer legs. */
    readonly categoryId: EntityId | null;
    /** Shared id linking TRANSFER_OUT and TRANSFER_IN; `null` for income/expense. */
    readonly transferGroupId: EntityId | null;
    /** Positive decimal-safe amount in {@link currency}. */
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: IsoDate;
    readonly description: string;
    readonly version: EntityVersion;
    readonly createdBy: EntityId;
    readonly updatedBy: EntityId;
    readonly deletedBy: EntityId | null;
    readonly createdAt: IsoTimestamp;
    readonly updatedAt: IsoTimestamp;
    readonly deletedAt: IsoTimestamp | null;
}
