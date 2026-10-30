import { Account } from '@balance/dto/accounts';

/**
 * Orders accounts by preferred ids, appending any accounts missing from the preference list.
 *
 * @param accounts Active accounts from the API.
 * @param preferredOrder User preference `accountOrder` (may include deleted ids).
 */
export function sortAccountsByPreference<T extends { readonly id: Account['id'] }>(
    accounts: readonly T[],
    preferredOrder: readonly Account['id'][],
): readonly T[] {
    if (accounts.length === 0) {
        return accounts;
    }

    const accountsMap = new Map(accounts.map((account) => [account.id, account]));
    const ordered: T[] = [];

    for (const id of preferredOrder) {
        const account = accountsMap.get(id);

        if (account) {
            ordered.push(account);
            accountsMap.delete(id);
        }
    }

    for (const account of accounts) {
        if (accountsMap.has(account.id)) {
            ordered.push(account);
        }
    }

    return ordered;
}
