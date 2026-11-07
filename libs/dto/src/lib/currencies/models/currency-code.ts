/** ISO 4217 currency codes supported by the API wire format. */
export const CURRENCY_CODES = ['RUB', 'USD', 'EUR'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];
