import { EntityVersion } from '../common';

/** Body for `PUT /categories/:id`. Type is create-only. */
export interface UpdateCategoryRequest {
    readonly name: string;
    readonly version: EntityVersion;
}
