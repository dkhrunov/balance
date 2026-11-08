import { describe, expect, it } from 'vitest';
import IMask from 'imask';
import { JSDOM } from 'jsdom';
import {
    canonicalAmountFromUnmasked,
    createMoneyMaskOptions,
    resolveMoneySeparators,
    isSameMoneyAmount,
} from './money-mask';

describe('resolveMoneySeparators', () => {
    it('uses en-US style separators', () => {
        expect(resolveMoneySeparators('en')).toEqual({
            radix: '.',
            thousandsSeparator: ',',
        });
    });

    it('uses ru-RU style separators', () => {
        const { radix, thousandsSeparator } = resolveMoneySeparators('ru');
        expect(radix).toBe(',');
        expect(thousandsSeparator.length).toBeGreaterThan(0);
        expect(thousandsSeparator).not.toBe(',');
        expect(thousandsSeparator).not.toBe('.');
    });
});

describe('createMoneyMaskOptions', () => {
    it('sets scale from Money.precision and locale separators', () => {
        const options = createMoneyMaskOptions('ru');

        expect(options.mask).toBe(Number);
        expect(options).toMatchObject({
            scale: 2,
            radix: ',',
            min: 0,
        });
        expect('mapToRadix' in options && options.mapToRadix).toEqual(expect.arrayContaining(['.']));
    });

    it('wraps the number block in a Pattern when prefix is set', () => {
        const options = createMoneyMaskOptions('en', '−');

        expect(options).toMatchObject({
            mask: '−num',
            lazy: false,
        });
        expect('blocks' in options && options.blocks?.num).toMatchObject({
            mask: Number,
            scale: 2,
            radix: '.',
            min: 0,
        });
    });
});

describe('canonicalAmountFromUnmasked', () => {
    it('normalizes unmasked IMask values via Money', () => {
        expect(canonicalAmountFromUnmasked('1234.5', 'USD')).toBe('1234.50');
        expect(canonicalAmountFromUnmasked('', 'USD')).toBe('');
    });

    it('returns null for incomplete fragments Money rejects', () => {
        expect(canonicalAmountFromUnmasked('.', 'EUR')).toBeNull();
    });
});

describe('isSameMoneyAmount', () => {
    it('treats padded and unpadded amounts as equal', () => {
        expect(isSameMoneyAmount('1234.5', '1234.50', 'USD')).toBe(true);
        expect(isSameMoneyAmount('', '', 'USD')).toBe(true);
        expect(isSameMoneyAmount('1', '', 'USD')).toBe(false);
    });
});

describe('prefix mask unmaskedValue', () => {
    it('keeps prefix in display but out of unmaskedValue and canonical amount', () => {
        const input = new JSDOM('<input />').window.document.querySelector('input');

        if (!input) {
            throw new Error('expected input');
        }

        const mask = IMask(input, createMoneyMaskOptions('en', '−'));

        expect(mask.value).toBe('−');
        expect(mask.unmaskedValue).toBe('');
        expect(canonicalAmountFromUnmasked(mask.unmaskedValue, 'USD')).toBe('');

        mask.unmaskedValue = '1234.5';
        expect(mask.value).toBe('−1,234.5');
        expect(mask.unmaskedValue).toBe('1234.5');
        expect(mask.unmaskedValue.includes('−')).toBe(false);
        expect(canonicalAmountFromUnmasked(mask.unmaskedValue, 'USD')).toBe('1234.50');

        mask.unmaskedValue = '';
        expect(mask.value).toBe('−');
        expect(mask.unmaskedValue).toBe('');

        mask.destroy();
    });
});
