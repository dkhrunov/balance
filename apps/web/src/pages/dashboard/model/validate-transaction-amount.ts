import { CurrencyCode } from '@balance/domain/currency';
import { Money } from '@balance/domain/money';
import { isIsoDate } from '../lib/iso-date';
import { TransactionFormErrorCode } from './error-codes';

export type ValidateTransactionAmountInput = {
    readonly amount: string;
    readonly currency: CurrencyCode;
    readonly transactionDate: string;
};

export type ValidateTransactionAmountResult =
    | { readonly ok: true; readonly amount: string }
    | { readonly ok: false; readonly error: TransactionFormErrorCode };

/**
 * Validates amount (positive decimal for currency) and transaction date format.
 */
export function validateTransactionAmount(
    input: ValidateTransactionAmountInput,
): ValidateTransactionAmountResult {
    if (!isIsoDate(input.transactionDate)) {
        return { ok: false, error: 'transactions.validation.date' };
    }

    try {
        const money = Money.create(input.currency, input.amount || '0');

        if (Money.compare(money, Money.create(input.currency, '0')) <= 0) {
            return { ok: false, error: 'transactions.validation.amountPositive' };
        }

        return { ok: true, amount: money.amount };
    } catch {
        return { ok: false, error: 'transactions.validation.amount' };
    }
}
