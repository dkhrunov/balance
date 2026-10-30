import { describe, expect, it } from 'vitest';
import { Money } from '../money';
import { AccountBalance } from './account-balance';

describe('AccountBalance.sumAmounts', () => {
    it('sums decimal strings without floating error', () => {
        expect(AccountBalance.sumAmounts('USD', ['0.10', '0.20'])).toBe('0.30');
    });

    it('returns zero when empty', () => {
        expect(AccountBalance.sumAmounts('EUR', [])).toBe('0.00');
    });
});

describe('AccountBalance.derive', () => {
    it('applies income, expense, and transfers', () => {
        const balance = AccountBalance.derive('100.00', 'RUB', [
            { type: 'INCOME', amount: '50.00', currency: 'RUB' },
            { type: 'EXPENSE', amount: '20.00', currency: 'RUB' },
            { type: 'TRANSFER_OUT', amount: '10.00', currency: 'RUB' },
            { type: 'TRANSFER_IN', amount: '5.00', currency: 'RUB' },
        ]);

        expect(balance).toBe('125.00');
    });

    it('skips other-currency rows', () => {
        expect(AccountBalance.derive('10.00', 'USD', [{ type: 'EXPENSE', amount: '3.00', currency: 'EUR' }])).toBe(
            '10.00',
        );
    });
});

describe('AccountBalance.apply / sumByTypes', () => {
    it('subtracts expenses from balance', () => {
        const next = AccountBalance.apply(Money.create('USD', '10.00'), 'EXPENSE', '2.50');
        expect(next.amount).toBe('7.50');
    });

    it('sums expense amounts only', () => {
        expect(
            AccountBalance.sumByTypes(
                'RUB',
                [
                    { type: 'EXPENSE', amount: '1.00', currency: 'RUB' },
                    { type: 'INCOME', amount: '9.00', currency: 'RUB' },
                    { type: 'EXPENSE', amount: '2.50', currency: 'RUB' },
                ],
                ['EXPENSE'],
            ),
        ).toBe('3.50');
    });
});

describe('AccountBalance.hasSufficientFunds', () => {
    it('allows when balance covers amount', () => {
        expect(AccountBalance.hasSufficientFunds('100.00', 'USD', '40.00')).toBe(true);
    });

    it('rejects when balance is short', () => {
        expect(AccountBalance.hasSufficientFunds('10.00', 'USD', '40.00')).toBe(false);
    });
});
