import { EntityId, EntityVersion, IsoDate, IsoTimestamp } from '../common';
import { CurrencyCode } from '../currencies';
import { TransactionType } from './transaction-type';

/** Income or expense posted to an account in the single app space. */
export interface Transaction {
    readonly id: EntityId;
    readonly type: TransactionType;
    readonly accountId: EntityId;
    readonly categoryId: EntityId;
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
