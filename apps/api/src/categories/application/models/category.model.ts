import { CategoryType } from '@balance/contracts/categories';

/** Application-layer category aggregate used by use cases and the repository. */
export type CategoryModel = {
    readonly id: string;
    readonly type: CategoryType;
    readonly name: string;
    readonly version: number;
    readonly createdBy: string;
    readonly updatedBy: string;
    readonly deletedBy: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};
