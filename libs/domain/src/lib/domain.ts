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

const STANDARD_FIAT_PRECISION = 2;

const CURRENCY_DEFINITIONS: Readonly<Record<CurrencyCode, CurrencyDefinition>> = {
    RUB: { code: 'RUB', precision: STANDARD_FIAT_PRECISION },
    USD: { code: 'USD', precision: STANDARD_FIAT_PRECISION },
    EUR: { code: 'EUR', precision: STANDARD_FIAT_PRECISION },
};

const DECIMAL_AMOUNT_PATTERN = /^(-?)(\d+)(?:\.(\d+))?$/;

const ZERO_MINOR_UNITS = BigInt('0');

export class MoneyValidationError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'MoneyValidationError';
    }
}

export class CurrencyMismatchError extends Error {
    public constructor(leftCurrency: CurrencyCode, rightCurrency: CurrencyCode) {
        super(`Cannot operate on ${leftCurrency} and ${rightCurrency}.`);
        this.name = 'CurrencyMismatchError';
    }
}

/**
 * An immutable monetary value represented as a canonical decimal string.
 *
 * Values remain strings at system boundaries. Static methods convert them to
 * integer minor units with BigInt only while performing calculations.
 */
export class Money {
    /** Canonical decimal amount at this currency's configured precision. */
    public readonly amount: string;

    /** ISO currency code associated with the amount. */
    public readonly currency: CurrencyCode;

    private constructor(currency: CurrencyCode, amount: string) {
        this.currency = currency;
        this.amount = amount;
    }

    /**
     * Determines whether an unknown runtime value is a supported currency code.
     *
     * @param value Value received from an untyped boundary.
     */
    public static isCurrencyCode(value: unknown): value is CurrencyCode {
        return typeof value === 'string' && value in CURRENCY_DEFINITIONS;
    }

    /**
     * Returns the immutable metadata for a supported currency.
     *
     * @param currency Supported currency code.
     */
    public static getCurrencyDefinition(currency: CurrencyCode): CurrencyDefinition {
        return CURRENCY_DEFINITIONS[currency];
    }

    /**
     * Returns the number of fractional decimal places permitted for a currency.
     *
     * @param currency Supported currency code.
     */
    public static getCurrencyPrecision(currency: CurrencyCode): number {
        return Money.getCurrencyDefinition(currency).precision;
    }

    /**
     * Creates an immutable monetary value and normalizes its decimal amount.
     *
     * @param currency Supported currency code.
     * @param amount Decimal string, with no more fractional digits than the currency supports.
     * @throws {MoneyValidationError} If amount is not a valid decimal string or exceeds currency precision.
     */
    public static create(currency: CurrencyCode, amount: string): Money {
        return new Money(currency, Money.formatMinorUnits(Money.parseAmountToMinorUnits(currency, amount), currency));
    }

    /**
     * Adds two amounts in the same currency using exact integer minor-unit arithmetic.
     *
     * @throws {CurrencyMismatchError} If the amounts use different currencies.
     */
    public static add(left: Money, right: Money): Money {
        Money.assertSameCurrency(left, right);

        return new Money(
            left.currency,
            Money.formatMinorUnits(
                Money.parseAmountToMinorUnits(left.currency, left.amount) +
                    Money.parseAmountToMinorUnits(right.currency, right.amount),
                left.currency,
            ),
        );
    }

    /**
     * Subtracts the right amount from the left amount using exact integer minor-unit arithmetic.
     *
     * @throws {CurrencyMismatchError} If the amounts use different currencies.
     */
    public static subtract(left: Money, right: Money): Money {
        Money.assertSameCurrency(left, right);

        return new Money(
            left.currency,
            Money.formatMinorUnits(
                Money.parseAmountToMinorUnits(left.currency, left.amount) -
                    Money.parseAmountToMinorUnits(right.currency, right.amount),
                left.currency,
            ),
        );
    }

    /**
     * Compares two amounts in the same currency.
     *
     * @returns `-1` when left is smaller, `0` when equal, otherwise `1`.
     * @throws {CurrencyMismatchError} If the amounts use different currencies.
     */
    public static compare(left: Money, right: Money): -1 | 0 | 1 {
        Money.assertSameCurrency(left, right);

        const difference =
            Money.parseAmountToMinorUnits(left.currency, left.amount) -
            Money.parseAmountToMinorUnits(right.currency, right.amount);

        if (difference < ZERO_MINOR_UNITS) {
            return -1;
        }

        if (difference > ZERO_MINOR_UNITS) {
            return 1;
        }

        return 0;
    }

    private static assertSameCurrency(left: Money, right: Money): void {
        if (left.currency !== right.currency) {
            throw new CurrencyMismatchError(left.currency, right.currency);
        }
    }

    private static parseAmountToMinorUnits(currency: CurrencyCode, amount: string): bigint {
        const [, sign, integerPart, fractionalPart = ''] = Money.parseDecimalAmount(amount);
        const precision = Money.getCurrencyPrecision(currency);
        Money.assertFractionalPrecision(currency, fractionalPart, precision);

        const fractionalMinorUnits = fractionalPart.padEnd(precision, '0');
        const minorUnits = BigInt(`${integerPart}${fractionalMinorUnits}`);

        return sign === '-' ? -minorUnits : minorUnits;
    }

    private static parseDecimalAmount(amount: string): RegExpExecArray {
        if (typeof amount !== 'string') {
            throw new MoneyValidationError('Money amount must be a decimal string.');
        }

        const match = DECIMAL_AMOUNT_PATTERN.exec(amount);

        if (!match) {
            throw new MoneyValidationError(`Invalid decimal amount: "${amount}".`);
        }

        return match;
    }

    private static assertFractionalPrecision(currency: CurrencyCode, fractionalPart: string, precision: number): void {
        if (fractionalPart.length > precision) {
            throw new MoneyValidationError(`${currency} supports at most ${String(precision)} decimal places.`);
        }
    }

    private static formatMinorUnits(minorUnits: bigint, currency: CurrencyCode): string {
        const precision = Money.getCurrencyPrecision(currency);
        const isNegative = minorUnits < ZERO_MINOR_UNITS;
        const absoluteMinorUnits = isNegative ? -minorUnits : minorUnits;
        const paddedDigits = absoluteMinorUnits.toString().padStart(precision + 1, '0');

        if (precision === 0) {
            return `${isNegative ? '-' : ''}${paddedDigits}`;
        }

        const integerPart = paddedDigits.slice(0, -precision);
        const fractionalPart = paddedDigits.slice(-precision);

        return `${isNegative ? '-' : ''}${integerPart}.${fractionalPart}`;
    }
}
