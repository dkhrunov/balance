/** ISO 4217 currency codes supported by the MVP API wire format. */
export const CURRENCY_CODES = ['RUB', 'USD', 'EUR'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];
