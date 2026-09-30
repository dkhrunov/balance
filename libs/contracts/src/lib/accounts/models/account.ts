import { EntityId, EntityVersion, IsoTimestamp } from '../../common';
import { CurrencyCode } from '../../currencies';
import { AccountIcon } from './account-icon';

/** Financial account in the single app space (no per-user ownership). */
export interface Account {
    readonly id: EntityId;
    readonly name: string;
    /** Carbon icon component name (e.g. `Wallet`); validated for length only on the API. */
    readonly icon: AccountIcon;
    readonly currency: CurrencyCode;
    /** Decimal-safe starting balance in {@link currency}. */
    readonly initialBalance: string;
    readonly version: EntityVersion;
    readonly createdBy: EntityId;
    readonly updatedBy: EntityId;
    readonly deletedBy: EntityId | null;
    readonly createdAt: IsoTimestamp;
    readonly updatedAt: IsoTimestamp;
    readonly deletedAt: IsoTimestamp | null;
}
