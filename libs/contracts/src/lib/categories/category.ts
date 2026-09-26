import { EntityId, EntityVersion, IsoTimestamp } from '../common';
import { CategoryIcon } from './category-icon';
import { CategoryType } from './category-type';

/** Income or expense category in the single app space (no per-user ownership). */
export interface Category {
    readonly id: EntityId;
    readonly type: CategoryType;
    readonly name: string;
    readonly icon: CategoryIcon;
    readonly version: EntityVersion;
    readonly createdBy: EntityId;
    readonly updatedBy: EntityId;
    readonly deletedBy: EntityId | null;
    readonly createdAt: IsoTimestamp;
    readonly updatedAt: IsoTimestamp;
    readonly deletedAt: IsoTimestamp | null;
}
