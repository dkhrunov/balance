import { EntityVersion } from '../common';

/** Body for `PUT /accounts/:id`. Currency and initialBalance are create-only. */
export interface UpdateAccountRequest {
    readonly name: string;
    readonly version: EntityVersion;
}
