import { Category } from './category';

/** Active (non-deleted) categories in the single app space. */
export interface ListCategoriesResponse {
    readonly items: readonly Category[];
}
