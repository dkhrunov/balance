import { Money, MoneyValidationError } from '@balance/domain/money';
import { CurrencyCode } from '@balance/dto/currencies';
import { Locale } from '@balance/dto/users';
import { MaskedNumberOptions, MaskedPatternOptions } from 'imask';
import { LOCALE_TAG } from '../../../i18n';

type MoneyMaskSeparators = {
    readonly radix: string;
    readonly thousandsSeparator: string;
};

/**
 * Resolves locale-specific decimal and grouping separators via `Intl`.
 *
 * @param locale App UI locale (`en` / `ru`).
 */
export function resolveMoneySeparators(locale: Locale): MoneyMaskSeparators {
    const parts = new Intl.NumberFormat(LOCALE_TAG[locale], {
        useGrouping: true,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).formatToParts(12345.6);

    return {
        radix: parts.find((part) => part.type === 'decimal')?.value ?? '.',
        thousandsSeparator: parts.find((part) => part.type === 'group')?.value ?? ',',
    };
}

/**
 * Builds IMask Number block options for a locale (grouping while typing).
 */
function createNumberBlockOptions(locale: Locale): MaskedNumberOptions {
    const { radix, thousandsSeparator } = resolveMoneySeparators(locale);
    const mapToRadix = ['.', ','].filter((candidate) => candidate !== radix);

    return {
        mask: Number,
        scale: Money.precision,
        radix,
        thousandsSeparator,
        mapToRadix,
        padFractionalZeros: false,
        normalizeZeros: true,
        min: 0,
    };
}

/**
 * Builds IMask options for a locale.
 * Optional `prefix` is a fixed Pattern leading segment (shown in the field); it is not part of
 * {@link InputMask.unmaskedValue} / the canonical amount.
 *
 * @param locale App UI locale (drives separators). Fractional scale is {@link Money.precision}.
 * @param prefix Optional leading display string (e.g. `−` for expenses). Prefer plain glyphs —
 *   avoid IMask Pattern metacharacters (`0`, `a`, `*`, `[]`, `{}`, backticks).
 */
export function createMoneyMaskOptions(locale: Locale, prefix?: string): MaskedNumberOptions | MaskedPatternOptions {
    const numberBlock = createNumberBlockOptions(locale);

    if (!prefix) {
        return numberBlock;
    }

    return {
        mask: `${prefix}num`,
        lazy: false,
        blocks: {
            num: numberBlock,
        },
    };
}

/**
 * Converts IMask Number `unmaskedValue` (`.` decimal) into a canonical {@link Money} amount.
 * Prefix characters from the Pattern mask are never present in `unmasked`.
 *
 * @returns Canonical amount, `''` when empty, or `null` when incomplete/invalid.
 */
export function canonicalAmountFromUnmasked(unmasked: string, currency: CurrencyCode): string | null {
    if (unmasked.trim().length === 0) {
        return '';
    }

    try {
        return Money.create(currency, unmasked).amount;
    } catch (reason) {
        if (reason instanceof MoneyValidationError) {
            return null;
        }

        throw reason;
    }
}

/**
 * Returns whether a mask unmasked value and a parent canonical amount represent the same money.
 * Avoids caret jumps when parent pads fractional digits (e.g. `1234.5` vs `1234.50`).
 */
export function isSameMoneyAmount(
    unmaskedOrCanonical: string,
    canonicalValue: string,
    currency: CurrencyCode,
): boolean {
    if (unmaskedOrCanonical === '' && canonicalValue === '') {
        return true;
    }

    if (unmaskedOrCanonical === '' || canonicalValue === '') {
        return false;
    }

    try {
        return Money.create(currency, unmaskedOrCanonical).amount === Money.create(currency, canonicalValue).amount;
    } catch {
        return false;
    }
}
