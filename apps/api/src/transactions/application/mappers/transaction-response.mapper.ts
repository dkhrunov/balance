import { Transaction } from '@balance/contracts/transactions';
import { TransactionModel } from '../models/transaction.model';

/**
 * Maps an application transaction model to the public wire contract.
 *
 * @param transaction Application-layer transaction.
 * @returns Contract `Transaction` response.
 */
export function toTransactionResponse(transaction: TransactionModel): Transaction {
    return {
        id: transaction.id,
        type: transaction.type,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        amount: transaction.amount,
        currency: transaction.currency,
        transactionDate: transaction.transactionDate,
        description: transaction.description,
        version: transaction.version,
        createdBy: transaction.createdBy,
        updatedBy: transaction.updatedBy,
        deletedBy: transaction.deletedBy,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        deletedAt: transaction.deletedAt ? transaction.deletedAt.toISOString() : null,
    };
}
