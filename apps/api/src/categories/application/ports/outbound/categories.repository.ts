import { CategoryType } from '@balance/contracts/categories';
import { CategoryModel } from '../../models/category.model';

/** Result of an optimistic-concurrency mutation against the categories store. */
export type CategoryMutationResult =
    | { readonly kind: 'ok'; readonly category: CategoryModel }
    | { readonly kind: 'not_found' }
    | { readonly kind: 'version_conflict' };

/** Input for inserting a new category row. */
export type CreateCategoryRecord = {
    readonly type: CategoryType;
    readonly name: string;
    readonly icon: string;
    readonly actorUserId: string;
};

/** Input for updating an active category with optimistic concurrency. */
export type UpdateCategoryRecord = {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
    readonly expectedVersion: number;
    readonly actorUserId: string;
};

/** Input for soft-deleting an active category with optimistic concurrency. */
export type SoftDeleteCategoryRecord = {
    readonly id: string;
    readonly expectedVersion: number;
    readonly actorUserId: string;
};

/**
 * Persistence port for income/expense categories in the single app space.
 */
export interface ICategoriesRepository {
    /**
     * Lists active categories, optionally filtered by type, newest first.
     *
     * @param type Optional INCOME or EXPENSE filter.
     */
    listActive(type?: CategoryType): Promise<readonly CategoryModel[]>;

    /**
     * Loads an active category by id.
     *
     * @param id Category id.
     * @returns Category or `null` when missing or soft-deleted.
     */
    findActiveById(id: string): Promise<CategoryModel | null>;

    /**
     * Inserts a new category; `createdBy` and `updatedBy` are the actor.
     *
     * @param input Create fields and actor.
     */
    create(input: CreateCategoryRecord): Promise<CategoryModel>;

    /**
     * Updates name and icon on an active category when `expectedVersion` matches.
     *
     * @param input Update fields, expected version, and actor.
     */
    updateActive(input: UpdateCategoryRecord): Promise<CategoryMutationResult>;

    /**
     * Soft-deletes an active category when `expectedVersion` matches.
     *
     * @param input Delete target, expected version, and actor.
     */
    softDeleteActive(input: SoftDeleteCategoryRecord): Promise<CategoryMutationResult>;
}

export const CATEGORIES_REPOSITORY = Symbol('CATEGORIES_REPOSITORY');
