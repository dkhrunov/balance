/** ISO 4217 code. The allowed set lives in currencies. */
export type CurrencyCode = string & { readonly __currencyCode?: never };

export class Currency {
    public readonly code: CurrencyCode;
    public readonly symbol: string;

    public constructor(code: CurrencyCode, symbol: string) {
        this.code = code;
        this.symbol = symbol;
    }
}
