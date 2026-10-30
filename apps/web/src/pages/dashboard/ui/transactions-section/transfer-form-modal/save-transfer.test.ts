/* eslint-disable ai-guard/no-floating-promise -- vitest Mock#mockClear is sync but typed loosely */
import { describe, expect, it, vi } from 'vitest';
import { saveTransfer } from './save-transfer';

const { deleteTransaction, createTransfer } = vi.hoisted(() => ({
    deleteTransaction: vi.fn(async (): Promise<never> => {
        await Promise.resolve();
        return {} as never;
    }),
    createTransfer: vi.fn(async (): Promise<never> => {
        await Promise.resolve();
        return {} as never;
    }),
}));

vi.mock('../../../../../shared/api', () => ({
    TransactionsApi: {
        deleteTransaction,
        createTransfer,
    },
}));

describe('saveTransfer', () => {
    it('creates outbound transfer from selected account', async () => {
        deleteTransaction.mockClear();
        createTransfer.mockClear();

        await saveTransfer({
            existing: null,
            type: 'TRANSFER_OUT',
            accountId: 'acc-from',
            otherAccountId: 'acc-to',
            currency: 'USD',
            amount: '15.00',
            transactionDate: '2026-01-01',
            description: '',
        });

        expect(createTransfer).toHaveBeenCalledWith({
            fromAccountId: 'acc-from',
            toAccountId: 'acc-to',
            amount: '15.00',
            currency: 'USD',
            transactionDate: '2026-01-01',
            description: undefined,
        });
    });

    it('creates inbound transfer to selected account', async () => {
        deleteTransaction.mockClear();
        createTransfer.mockClear();

        await saveTransfer({
            existing: null,
            type: 'TRANSFER_IN',
            accountId: 'acc-to',
            otherAccountId: 'acc-from',
            currency: 'USD',
            amount: '15.00',
            transactionDate: '2026-01-01',
            description: 'note',
        });

        expect(createTransfer).toHaveBeenCalledWith({
            fromAccountId: 'acc-from',
            toAccountId: 'acc-to',
            amount: '15.00',
            currency: 'USD',
            transactionDate: '2026-01-01',
            description: 'note',
        });
    });
});
