import { CurrencyCode } from '@balance/domain/currency';
import { TransactionType } from '@balance/domain/transactions';

/**
 * Row shape for balance-derivation queries (type/amount/currency only).
 */
export type TransactionBalanceRecord = {
    type: TransactionType;
    amount: string;
    currency: CurrencyCode;
};
