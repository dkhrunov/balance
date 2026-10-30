import { Category } from '../models/category';

/** Active (non-deleted) categories in the single app space. */
export interface QueryCategoriesResponse {
    readonly items: readonly Category[];
}
