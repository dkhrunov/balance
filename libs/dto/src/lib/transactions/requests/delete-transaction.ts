import { EntityVersion } from '../../common';

/** Body for `DELETE /transactions/:id` (optimistic concurrency). */
export interface DeleteTransactionRequest {
    readonly version: EntityVersion;
}
