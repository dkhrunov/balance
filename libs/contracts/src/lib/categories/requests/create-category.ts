import { CategoryIcon } from '../models/category-icon';
import { CategoryType } from '../models/category-type';

/** Body for `POST /categories`. */
export interface CreateCategoryRequest {
    readonly type: CategoryType;
    readonly name: string;
    readonly icon?: CategoryIcon;
}
