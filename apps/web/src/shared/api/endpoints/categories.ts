import {
    Category,
    CategoryType,
    CreateCategoryRequest,
    DeleteCategoryRequest,
    QueryCategoriesResponse,
    UpdateCategoryRequest,
} from '@balance/dto/categories';
import { ApiClient } from '../api-client';

export class CategoriesApi {
    private constructor() {
        /* empty constructor */
    }

    /** Queries active categories; optionally filtered by income/expense type. */
    public static queryCategories(type?: CategoryType): Promise<QueryCategoriesResponse> {
        if (!type) {
            return ApiClient.get<QueryCategoriesResponse>('/categories');
        }

        const query = new URLSearchParams({ type });

        return ApiClient.get<QueryCategoriesResponse>(`/categories?${query.toString()}`);
    }

    /** Loads one active category by id. */
    public static getCategory(categoryId: Category['id']): Promise<Category> {
        return ApiClient.get<Category>(`/categories/${categoryId}`);
    }

    /** Creates an income or expense category. */
    public static createCategory(request: CreateCategoryRequest): Promise<Category> {
        return ApiClient.post<Category>('/categories', request);
    }

    /** Updates a category name/icon with optimistic concurrency. */
    public static updateCategory(
        categoryId: Category['id'],
        request: UpdateCategoryRequest,
    ): Promise<Category> {
        return ApiClient.put<Category>(`/categories/${categoryId}`, request);
    }

    /** Soft-deletes a category with optimistic concurrency. */
    public static deleteCategory(
        categoryId: Category['id'],
        request: DeleteCategoryRequest,
    ): Promise<Category> {
        return ApiClient.delete<Category>(`/categories/${categoryId}`, request);
    }
}
