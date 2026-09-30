import { Category, DeleteCategoryRequest } from '@balance/dto/categories';

/** Soft-deletes an active category with optimistic concurrency. */
export interface IDeleteCategoryUseCase {
    /**
     * @param actorUserId Authenticated user performing the soft-delete.
     * @param categoryId Category id.
     * @param request Expected version.
     */
    execute(actorUserId: string, categoryId: string, request: DeleteCategoryRequest): Promise<Category>;
}

export const DELETE_CATEGORY_USE_CASE = Symbol('DELETE_CATEGORY_USE_CASE');
