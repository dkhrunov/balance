/**
 * i18n keys for transaction form validation errors.
 * Lib returns codes; UI maps them with `t(code)`.
 */
export type TransactionFormErrorCode =
    | 'transactions.validation.amount'
    | 'transactions.validation.amountPositive'
    | 'transactions.validation.date'
    | 'transactions.validation.category'
    | 'transactions.validation.transferTarget';
