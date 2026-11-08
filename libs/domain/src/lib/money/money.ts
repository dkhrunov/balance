import { CurrencyCode } from '../currency';

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
    /** Fractional digits for every amount. Not stored per currency. */
    public static readonly precision = 2;

    /** Canonical decimal amount at {@link Money.precision}. */
    public readonly amount: string;

    /** ISO currency code associated with the amount. */
    public readonly currency: CurrencyCode;

    private constructor(currency: CurrencyCode, amount: string) {
        this.currency = currency;
        this.amount = amount;
    }

    /**
     * Creates an immutable monetary value and normalizes its decimal amount.
     *
     * @param currency ISO currency code carried with the amount.
     * @param amount Decimal string, with no more fractional digits than {@link Money.precision}.
     * @throws {MoneyValidationError} If amount is not a valid decimal string or exceeds {@link Money.precision}.
     */
    public static create(currency: CurrencyCode, amount: string): Money {
        return new Money(currency, Money.formatMinorUnits(Money.parseAmountToMinorUnits(currency, amount)));
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
        Money.assertFractionalPrecision(currency, fractionalPart);

        const fractionalMinorUnits = fractionalPart.padEnd(Money.precision, '0');
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

    private static assertFractionalPrecision(currency: CurrencyCode, fractionalPart: string): void {
        if (fractionalPart.length > Money.precision) {
            throw new MoneyValidationError(
                `${currency} supports at most ${String(Money.precision)} decimal places.`,
            );
        }
    }

    private static formatMinorUnits(minorUnits: bigint): string {
        const isNegative = minorUnits < ZERO_MINOR_UNITS;
        const absoluteMinorUnits = isNegative ? -minorUnits : minorUnits;
        const paddedDigits = absoluteMinorUnits.toString().padStart(Money.precision + 1, '0');
        const integerPart = paddedDigits.slice(0, -Money.precision);
        const fractionalPart = paddedDigits.slice(-Money.precision);

        return `${isNegative ? '-' : ''}${integerPart}.${fractionalPart}`;
    }
}
