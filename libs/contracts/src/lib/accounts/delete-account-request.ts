import { EntityVersion } from '../common';

/** Body for `DELETE /accounts/:id` (optimistic concurrency). */
export interface DeleteAccountRequest {
    readonly version: EntityVersion;
}
