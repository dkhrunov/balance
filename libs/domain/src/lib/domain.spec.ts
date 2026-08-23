import { describe, expect, it } from 'vitest';
import { CurrencyMismatchError, Money, MoneyValidationError } from './domain';

const STANDARD_FIAT_PRECISION = 2;
const UNSAFE_NUMBER_AMOUNT = 0.1;

describe('Money', () => {
    it('normalizes a decimal string to the currency precision', () => {
        expect(Money.create('RUB', '001.2')).toEqual({
            amount: '1.20',
            currency: 'RUB',
        });
    });

    it('adds decimal amounts exactly without JavaScript number arithmetic', () => {
        const result = Money.add(Money.create('USD', '0.10'), Money.create('USD', '0.20'));

        expect(result).toEqual({ amount: '0.30', currency: 'USD' });
    });

    it('subtracts decimal amounts exactly', () => {
        const result = Money.subtract(Money.create('EUR', '10.00'), Money.create('EUR', '3.75'));

        expect(result).toEqual({ amount: '6.25', currency: 'EUR' });
    });

    it('compares values using integer minor units', () => {
        expect(Money.compare(Money.create('RUB', '-0.01'), Money.create('RUB', '0'))).toBe(-1);
        expect(Money.compare(Money.create('RUB', '1.00'), Money.create('RUB', '1'))).toBe(0);
        expect(Money.compare(Money.create('RUB', '1.01'), Money.create('RUB', '1.00'))).toBe(1);
    });

    it('exposes precision through the currency registry', () => {
        expect(Money.getCurrencyPrecision('RUB')).toBe(STANDARD_FIAT_PRECISION);
        expect(Money.getCurrencyPrecision('USD')).toBe(STANDARD_FIAT_PRECISION);
        expect(Money.getCurrencyPrecision('EUR')).toBe(STANDARD_FIAT_PRECISION);
    });

    it('rejects unsafe number values and malformed decimal input', () => {
        expect(() => Money.create('RUB', UNSAFE_NUMBER_AMOUNT as unknown as string)).toThrow(MoneyValidationError);
        expect(() => Money.create('RUB', '1.234')).toThrow(MoneyValidationError);
        expect(() => Money.create('RUB', '1e3')).toThrow(MoneyValidationError);
    });

    it('rejects arithmetic across currencies', () => {
        expect(() => Money.add(Money.create('RUB', '1'), Money.create('USD', '1'))).toThrow(CurrencyMismatchError);
    });
});
