import { CurrencyCode } from '../currency';
import { Money } from '../money';
import { TransactionType } from './transaction-type';

/** Ledger row used when deriving or aggregating an account balance. */
export type BalanceTransaction = {
    readonly type: TransactionType;
    readonly amount: string;
    readonly currency: CurrencyCode;
};

/**
 * Account balance rules: how transaction types affect a running balance,
 * and helpers to derive / aggregate amounts for one currency.
 */
export class AccountBalance {
    private constructor() {
        /* empty constructor */
    }

    /**
     * Returns whether a transaction type increases account balance.
     *
     * @param type Transaction type on the account ledger.
     */
    public static isIncreasingType(type: TransactionType): boolean {
        return type === 'INCOME' || type === 'TRANSFER_IN';
    }

    /**
     * Applies one transaction to a running balance (same currency).
     *
     * @param balance Current balance as Money.
     * @param type Transaction type.
     * @param amount Positive decimal-safe transaction amount.
     */
    public static apply(balance: Money, type: TransactionType, amount: string): Money {
        const delta = Money.create(balance.currency, amount);

        if (AccountBalance.isIncreasingType(type)) {
            return Money.add(balance, delta);
        }

        return Money.subtract(balance, delta);
    }

    /**
     * Derives current account balance: `initialBalance` ± transactions in that currency.
     *
     * @param initialBalance Account starting balance (decimal string).
     * @param currency Account currency.
     * @param transactions Transactions already scoped to the account (caller filters deleted/date).
     */
    public static derive(
        initialBalance: string,
        currency: CurrencyCode,
        transactions: readonly BalanceTransaction[],
    ): string {
        let balance = Money.create(currency, initialBalance);

        for (const transaction of transactions) {
            if (transaction.currency !== currency) {
                continue;
            }

            balance = AccountBalance.apply(balance, transaction.type, transaction.amount);
        }

        return balance.amount;
    }

    /**
     * Sums decimal-safe amounts in one currency via {@link Money.add}.
     *
     * @param currency Shared currency for all amounts.
     * @param amounts Decimal strings (may be empty → `"0"` at currency precision).
     */
    public static sumAmounts(currency: CurrencyCode, amounts: readonly string[]): string {
        let total = Money.create(currency, '0');

        for (const amount of amounts) {
            total = Money.add(total, Money.create(currency, amount));
        }

        return total.amount;
    }

    /**
     * Sums absolute amounts for transactions matching any of the given types.
     *
     * @param currency Shared currency.
     * @param transactions Transactions to include (caller filters account/date/deleted).
     * @param types Types whose amounts are summed (e.g. only `EXPENSE`).
     */
    public static sumByTypes(
        currency: CurrencyCode,
        transactions: readonly BalanceTransaction[],
        types: readonly TransactionType[],
    ): string {
        const allowed = new Set(types);
        const amounts = transactions
            .filter((transaction) => transaction.currency === currency && allowed.has(transaction.type))
            .map((transaction) => transaction.amount);

        return AccountBalance.sumAmounts(currency, amounts);
    }

    /**
     * Whether `amount` fits in available balance for an outbound expense/transfer.
     *
     * When editing an existing outbound row, pass its amount as `restoreOutboundAmount`
     * so that amount is treated as still available (it is already reflected in
     * `currentBalance`).
     *
     * @param currentBalance Derived account balance (decimal string).
     * @param currency Account currency.
     * @param amount Requested outbound amount (positive decimal string).
     */
    public static hasSufficientFunds(currentBalance: string, currency: CurrencyCode, amount: string): boolean {
        const available = Money.create(currency, currentBalance);

        return Money.compare(available, Money.create(currency, amount)) >= 0;
    }
}
