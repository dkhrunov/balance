import { EntityVersion } from '../common';
import { AccountIcon } from './account-icon';

/** Body for `PUT /accounts/:id`. Currency and initialBalance are create-only. */
export interface UpdateAccountRequest {
    readonly name: string;
    readonly icon: AccountIcon;
    readonly version: EntityVersion;
}
