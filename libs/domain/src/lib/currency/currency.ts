// TODO: store currencies in the database instead of hardcoding them here
/**
 * Currencies supported by the MVP. Add new currencies to CURRENCY_DEFINITIONS
 * rather than scattering precision assumptions through the application.
 */
export const CURRENCY_CODES = ['RUB', 'USD', 'EUR'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export interface CurrencyDefinition {
    readonly code: CurrencyCode;
    readonly precision: number;
}
