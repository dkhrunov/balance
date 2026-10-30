import { describe, expect, it } from 'vitest';
import { validateTransactionAmount } from './validate-transaction-amount';

describe('validateTransactionAmount', () => {
    it('rejects invalid date', () => {
        expect(
            validateTransactionAmount({
                amount: '10.00',
                currency: 'USD',
                transactionDate: '2026/01/01',
            }),
        ).toEqual({ ok: false, error: 'transactions.validation.date' });
    });

    it('rejects non-positive amount', () => {
        expect(
            validateTransactionAmount({
                amount: '0',
                currency: 'USD',
                transactionDate: '2026-01-01',
            }),
        ).toEqual({ ok: false, error: 'transactions.validation.amountPositive' });
    });

    it('rejects invalid amount', () => {
        expect(
            validateTransactionAmount({
                amount: 'abc',
                currency: 'USD',
                transactionDate: '2026-01-01',
            }),
        ).toEqual({ ok: false, error: 'transactions.validation.amount' });
    });

    it('returns normalized amount', () => {
        expect(
            validateTransactionAmount({
                amount: '12.5',
                currency: 'USD',
                transactionDate: '2026-01-01',
            }),
        ).toEqual({ ok: true, amount: '12.50' });
    });
});
