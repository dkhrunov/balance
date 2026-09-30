import { CategoryType, ListCategoriesResponse } from '@balance/contracts/categories';

/** Lists active categories, optionally filtered by type. */
export interface IListCategoriesUseCase {
    /**
     * @param type Optional INCOME or EXPENSE filter.
     */
    execute(type?: CategoryType): Promise<ListCategoriesResponse>;
}

export const LIST_CATEGORIES_USE_CASE = Symbol('LIST_CATEGORIES_USE_CASE');
