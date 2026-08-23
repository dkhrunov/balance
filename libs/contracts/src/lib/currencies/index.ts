/**
 * Currency code at the API boundary.
 * The supported-code union is introduced with the money and currency domain task.
 */
export type CurrencyCode = string & { readonly __currencyCode?: never };

/** Minimal currency representation for future API contracts. */
export interface CurrencyContractPlaceholder {
    readonly code: CurrencyCode;
}
