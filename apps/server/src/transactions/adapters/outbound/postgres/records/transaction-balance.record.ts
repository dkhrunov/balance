import { CurrencyCode } from '@balance/dto/currencies';
import { TransactionType } from '@balance/dto/transactions';

/**
 * Row shape for balance-derivation queries (type/amount/currency only).
 */
export type TransactionBalanceRecord = {
    type: TransactionType;
    amount: string;
    currency: CurrencyCode;
};
