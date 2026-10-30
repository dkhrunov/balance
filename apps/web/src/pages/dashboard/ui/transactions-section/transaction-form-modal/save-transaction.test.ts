/* eslint-disable ai-guard/no-floating-promise -- vitest Mock#mockClear is sync but typed loosely */
import { describe, expect, it, vi } from 'vitest';
import { saveTransaction } from './save-transaction';

const { deleteTransaction, createTransaction } = vi.hoisted(() => ({
    deleteTransaction: vi.fn(async (): Promise<never> => {
        await Promise.resolve();
        return {} as never;
    }),
    createTransaction: vi.fn(async (): Promise<never> => {
        await Promise.resolve();
        return {} as never;
    }),
}));

vi.mock('../../../../../shared/api', () => ({
    TransactionsApi: {
        deleteTransaction,
        createTransaction,
    },
}));

describe('saveTransaction', () => {
    it('creates without delete on create', async () => {
        deleteTransaction.mockClear();
        createTransaction.mockClear();

        await saveTransaction({
            existing: null,
            type: 'EXPENSE',
            accountId: 'acc-1',
            categoryId: 'cat-1',
            currency: 'USD',
            amount: '10.00',
            transactionDate: '2026-01-01',
            description: ' lunch ',
        });

        expect(deleteTransaction).not.toHaveBeenCalled();
        expect(createTransaction).toHaveBeenCalledWith({
            type: 'EXPENSE',
            accountId: 'acc-1',
            categoryId: 'cat-1',
            amount: '10.00',
            currency: 'USD',
            transactionDate: '2026-01-01',
            description: 'lunch',
        });
    });

    it('deletes then creates on edit', async () => {
        deleteTransaction.mockClear();
        createTransaction.mockClear();

        await saveTransaction({
            existing: {
                id: 'tx-1',
                type: 'EXPENSE',
                accountId: 'acc-1',
                categoryId: 'cat-1',
                transferGroupId: null,
                amount: '5.00',
                currency: 'USD',
                transactionDate: '2026-01-01',
                description: '',
                version: 3,
                createdBy: 'u1',
                updatedBy: 'u1',
                deletedBy: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
                deletedAt: null,
            },
            type: 'INCOME',
            accountId: 'acc-1',
            categoryId: 'cat-2',
            currency: 'USD',
            amount: '8.00',
            transactionDate: '2026-01-02',
            description: '',
        });

        expect(deleteTransaction).toHaveBeenCalledWith('tx-1', { version: 3 });
        expect(createTransaction).toHaveBeenCalled();
    });
});
