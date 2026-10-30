import { CategoryType, QueryCategoriesResponse } from '@balance/dto/categories';

/** Queries active categories, optionally filtered by type. */
export interface IQueryCategoriesUseCase {
    /**
     * @param type Optional INCOME or EXPENSE filter.
     */
    execute(type?: CategoryType): Promise<QueryCategoriesResponse>;
}

export const QUERY_CATEGORIES_USE_CASE = Symbol('QUERY_CATEGORIES_USE_CASE');
