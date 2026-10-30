import { describe, expect, it } from 'vitest';
import { formatMoney, getCurrencySymbol } from './money';

describe('formatMoney', () => {
    it('formats RUB with a narrow symbol for en locale', () => {
        const formatted = formatMoney('1234.50', 'RUB', 'en');
        expect(formatted).toMatch(/1[,.]234/);
        expect(formatted).toContain('50');
        expect(formatted).toContain('₽');
    });

    it('formats USD for ru locale', () => {
        const formatted = formatMoney('10.00', 'USD', 'ru');
        expect(formatted).toContain('10');
        expect(formatted.toLowerCase()).toMatch(/\$|usd|долл/i);
    });
});

describe('getCurrencySymbol', () => {
    it('returns narrow symbols for supported currencies', () => {
        expect(getCurrencySymbol('RUB', 'en')).toBe('₽');
        expect(getCurrencySymbol('USD', 'en')).toBe('$');
        expect(getCurrencySymbol('EUR', 'en')).toBe('€');
    });
});
