import { Account } from '@balance/dto/accounts';
import { Category } from '@balance/dto/categories';
import { CurrencyCode } from '@balance/domain/currency';
import { IncomeExpenseType, Transaction } from '@balance/dto/transactions';
import { TransactionsApi } from '../../../../../shared/api';

export type SaveTransactionInput = {
    readonly existing: Transaction | null;
    readonly type: IncomeExpenseType;
    readonly accountId: Account['id'];
    readonly categoryId: Category['id'];
    readonly currency: CurrencyCode;
    readonly amount: string;
    readonly transactionDate: string;
    readonly description: string;
};

/**
 * Persists an income/expense: soft-deletes `existing` when editing, then creates.
 */
export async function saveTransaction(input: SaveTransactionInput): Promise<void> {
    if (input.existing) {
        await TransactionsApi.deleteTransaction(input.existing.id, {
            version: input.existing.version,
        });
    }

    await TransactionsApi.createTransaction({
        type: input.type,
        accountId: input.accountId,
        categoryId: input.categoryId,
        amount: input.amount,
        currency: input.currency,
        transactionDate: input.transactionDate,
        description: input.description.trim() || undefined,
    });
}
