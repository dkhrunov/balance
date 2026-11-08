import { CurrencyCode, CurrencyItem } from '@balance/dto/currencies';
import { Locale } from '@balance/dto/users';
import { LOCALE_TAG } from '../../../shared/i18n';

/**
 * Localized currency name from `Intl.DisplayNames`.
 *
 * Returns `null` when the runtime cannot name `key`.
 */
export function currencyName(currency: CurrencyCode, locale: Locale): string | null {
    try {
        const name = new Intl.DisplayNames([LOCALE_TAG[locale]], { type: 'currency' }).of(currency);

        if (!name || name.toUpperCase() === currency.toUpperCase()) {
            return null;
        }

        return name.charAt(0).toUpperCase() + name.slice(1);
    } catch {
        return null;
    }
}

/**
 * Label for a currency row: localized name and symbol in format "Name (Symbol)".
 *
 * Falls back to `key` when either part is missing.
 */
export function currencyNameWithSymbol(item: CurrencyItem, locale: Locale): string {
    const name = currencyName(item.key, locale);
    const symbol = item.symbol.trim();

    if (!name || symbol.length === 0) {
        return item.key;
    }

    return `${name} (${symbol})`;
}
