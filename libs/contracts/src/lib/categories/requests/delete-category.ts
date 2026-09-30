import { EntityVersion } from '../../common';

/** Body for `DELETE /categories/:id` (optimistic concurrency). */
export interface DeleteCategoryRequest {
    readonly version: EntityVersion;
}
