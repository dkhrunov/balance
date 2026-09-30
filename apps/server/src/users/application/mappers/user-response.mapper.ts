import { UserIdentity } from '@balance/contracts/users';
import { UserAccount } from '../models/user-account';

/** Converts a user account into a safe {@link UserIdentity}. */
export function toUserIdentity(account: UserAccount): UserIdentity {
    return {
        id: account.id,
        email: account.email,
        displayName: account.displayName,
        defaultCurrencyCode: account.defaultCurrencyCode,
        createdAt: account.createdAt.toISOString(),
    };
}
