import { Money } from '@balance/domain/money';
import { CurrencyCode } from '@balance/domain/currency';
import { Locale } from '@balance/dto/users';
import { LOCALE_TAG } from '../../i18n';

/**
 * Formats a decimal-safe amount for UI display via `Intl.NumberFormat`.
 * Aggregation must use {@link Money}; Number is used only for Intl.
 *
 * @param amount Canonical decimal string.
 * @param currency ISO currency code.
 * @param symbol Display symbol for `currency`. The caller supplies it.
 * @param locale App UI locale (`en` / `ru`).
 */
export function formatMoney(amount: string, currency: CurrencyCode, symbol: string, locale: Locale): string {
    const money = Money.create(currency, amount);
    const precision = Money.precision;

    try {
        return new Intl.NumberFormat(LOCALE_TAG[locale], {
            style: 'currency',
            currency: money.currency,
            currencyDisplay: 'code',
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        })
            .formatToParts(Number(money.amount))
            .map((part) => (part.type === 'currency' ? symbol : part.value))
            .join('');
    } catch {
        return `${symbol} ${money.amount}`;
    }
}
