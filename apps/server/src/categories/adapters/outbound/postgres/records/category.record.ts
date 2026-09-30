import { CategoryType } from '@balance/dto/categories';

/** Row shape returned from `categories` queries (camelCase aliases). */
export type CategoryRecord = {
    id: string;
    type: CategoryType;
    name: string;
    icon: string;
    version: number;
    createdBy: string;
    updatedBy: string;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};
