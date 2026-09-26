import { CategoryType } from '@balance/contracts/categories';

/** Row shape returned from `categories` queries (camelCase aliases). */
export type CategoryRecord = {
    id: string;
    type: CategoryType;
    name: string;
    version: number;
    createdBy: string;
    updatedBy: string;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
