import { Category, CreateCategoryRequest } from '@balance/contracts/categories';

/** Creates an income or expense category in the single app space. */
export interface ICreateCategoryUseCase {
    /**
     * @param actorUserId Authenticated user performing the create (attribution, not ownership).
     * @param request Create payload.
     */
    execute(actorUserId: string, request: CreateCategoryRequest): Promise<Category>;
}

export const CREATE_CATEGORY_USE_CASE = Symbol('CREATE_CATEGORY_USE_CASE');
