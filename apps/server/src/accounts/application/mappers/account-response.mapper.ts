import { Account } from '@balance/contracts/accounts';
import { AccountModel } from '../models/account.model';

/**
 * Maps an application account model to the public wire contract.
 *
 * @param account Application-layer account.
 * @returns Contract `Account` response.
 */
export function toAccountResponse(account: AccountModel): Account {
    return {
        id: account.id,
        name: account.name,
        icon: account.icon,
        currency: account.currency,
        initialBalance: account.initialBalance,
        version: account.version,
        createdBy: account.createdBy,
        updatedBy: account.updatedBy,
        deletedBy: account.deletedBy,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
        deletedAt: account.deletedAt ? account.deletedAt.toISOString() : null,
    };
}
