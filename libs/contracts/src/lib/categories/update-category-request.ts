import { EntityVersion } from '../common';
import { CategoryIcon } from './category-icon';

/** Body for `PUT /categories/:id`. Type is create-only. */
export interface UpdateCategoryRequest {
    readonly name: string;
    readonly icon: CategoryIcon;
    readonly version: EntityVersion;
}
