import { EntityId } from '../../common';
import { Transaction } from '../models/transaction';

/** Both legs of an atomic transfer sharing one `transferGroupId`. */
export interface CreateTransferResponse {
    readonly transferGroupId: EntityId;
    readonly out: Transaction;
    readonly in: Transaction;
}
