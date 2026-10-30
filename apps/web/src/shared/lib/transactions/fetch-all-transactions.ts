import { QueryTransactionsRequest, Transaction } from '@balance/dto/transactions';
import { TransactionsApi } from '../../api';

const PAGE_LIMIT = 100;

/**
 * Loads every page of transactions for the given filter (cursor walk).
 * MVP volumes stay small; prefer account-scoped calls from the dashboard.
 *
 * @param request Query filters (typically `accountId`).
 */
export async function fetchAllTransactions(
    request: QueryTransactionsRequest = {},
): Promise<readonly Transaction[]> {
    const items: Transaction[] = [];
    let cursor: string | undefined;

    for (;;) {
        const page = await TransactionsApi.queryTransactions({
            ...request,
            cursor,
            limit: request.limit ?? PAGE_LIMIT,
        });

        items.push(...page.items);

        if (!page.nextCursor) {
            break;
        }

        cursor = page.nextCursor;
    }

    return items;
}
