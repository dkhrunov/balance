import { Account } from '@balance/dto/accounts';
import { CurrencyCode } from '@balance/domain/currency';
import { Transaction, TransferType } from '@balance/dto/transactions';
import { TransactionsApi } from '../../../../../shared/api';

export type SaveTransferInput = {
    readonly existing: Transaction | null;
    readonly type: TransferType;
    readonly accountId: Account['id'];
    readonly otherAccountId: Account['id'];
    readonly currency: CurrencyCode;
    readonly amount: string;
    readonly transactionDate: string;
    readonly description: string;
};

/**
 * Persists a transfer: soft-deletes `existing` when editing, then creates.
 * `TRANSFER_OUT` = from selected account to other account ; `TRANSFER_IN` = reverse.
 */
export async function saveTransfer(input: SaveTransferInput): Promise<void> {
    if (input.existing) {
        await TransactionsApi.deleteTransaction(input.existing.id, {
            version: input.existing.version,
        });
    }

    const isOutbound = input.type === 'TRANSFER_OUT';

    await TransactionsApi.createTransfer({
        fromAccountId: isOutbound ? input.accountId : input.otherAccountId,
        toAccountId: isOutbound ? input.otherAccountId : input.accountId,
        amount: input.amount,
        currency: input.currency,
        transactionDate: input.transactionDate,
        description: input.description.trim() || undefined,
    });
}
