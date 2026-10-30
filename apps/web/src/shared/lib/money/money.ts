import { Money } from '@balance/domain/money';
import { CurrencyCode } from '@balance/dto/currencies';
import { Locale } from '@balance/dto/users';

/**
 * BCP 47 tags for app {@link Locale} values — shared by Intl formatting and input masks.
 */
export const MONEY_LOCALE_TAG: Record<Locale, string> = {
    en: 'en-US',
    ru: 'ru-RU',
};

/**
 * Formats a decimal-safe amount for UI display via `Intl.NumberFormat`.
 * Aggregation must use {@link Money}; Number is used only for Intl.
 *
 * @param amount Canonical decimal string.
 * @param currency ISO currency code.
 * @param locale App UI locale (`en` / `ru`).
 */
export function formatMoney(amount: string, currency: CurrencyCode, locale: Locale): string {
    const money = Money.create(currency, amount);
    const precision = Money.getCurrencyPrecision(money.currency);

    return new Intl.NumberFormat(MONEY_LOCALE_TAG[locale], {
        style: 'currency',
        currency: money.currency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(Number(money.amount));
}

/**
 * Returns the narrow currency symbol for adornments (e.g. `₽`, `$`, `€`).
 * Falls back to the ISO code when Intl has no symbol part.
 *
 * @param currency ISO currency code.
 * @param locale App UI locale (`en` / `ru`).
 */
export function getCurrencySymbol(currency: CurrencyCode, locale: Locale): string {
    const parts = new Intl.NumberFormat(MONEY_LOCALE_TAG[locale], {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);

    return parts.find((part) => part.type === 'currency')?.value ?? currency;
}
