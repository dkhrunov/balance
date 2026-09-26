import { CategoryIcon } from './category-icon';
import { CategoryType } from './category-type';

/** Body for `POST /categories`. */
export interface CreateCategoryRequest {
    readonly type: CategoryType;
    readonly name: string;
    readonly icon?: CategoryIcon;
}
