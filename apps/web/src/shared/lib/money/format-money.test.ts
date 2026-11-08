import { describe, expect, it } from 'vitest';
import { formatMoney } from './format-money';

describe('formatMoney', () => {
    it('formats an amount with the symbol supplied by the caller', () => {
        const formatted = formatMoney('1234.50', 'RUB', '₽', 'en');

        expect(formatted).toMatch(/1[,.]234/);
        expect(formatted).toContain('50');
        expect(formatted).toContain('₽');
    });

    it('shows the symbol the caller passed when no currency row matches', () => {
        const formatted = formatMoney('10.00', 'USD', 'USD', 'ru');

        expect(formatted).toContain('10');
        expect(formatted).toContain('USD');
    });
});
