import { Category } from '@balance/contracts/categories';

/** Loads one active category by id. */
export interface IGetCategoryUseCase {
    execute(categoryId: string): Promise<Category>;
}

export const GET_CATEGORY_USE_CASE = Symbol('GET_CATEGORY_USE_CASE');
