/** ISO 4217 code. Allowed values are keys in currencies, not a fixed list. */
export type CurrencyCode = string & { readonly __currencyCode?: never };
