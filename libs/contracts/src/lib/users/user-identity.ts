import { EntityId, IsoTimestamp } from '../common';
import { CurrencyCode } from '../currencies';

/** Public user identity safe to expose to authenticated clients. */
export interface UserIdentity {
    readonly id: EntityId;
    readonly email: string;
    readonly displayName: string;
    readonly defaultCurrencyCode: CurrencyCode;
    readonly createdAt: IsoTimestamp;
}
