import { Category, UpdateCategoryRequest } from '@balance/dto/categories';

/** Renames an active category with optimistic concurrency. */
export interface IUpdateCategoryUseCase {
    /**
     * @param actorUserId Authenticated user performing the update.
     * @param categoryId Category id.
     * @param request Name and expected version.
     */
    execute(actorUserId: string, categoryId: string, request: UpdateCategoryRequest): Promise<Category>;
}

export const UPDATE_CATEGORY_USE_CASE = Symbol('UPDATE_CATEGORY_USE_CASE');
