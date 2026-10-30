import { BadRequestException } from '@nestjs/common';
import { CurrencyCode } from '@balance/domain/currency';
import { AccountBalance } from '@balance/domain/transactions';
import { TRANSACTION_ERROR_CODES } from '@balance/dto/transactions';
import { ITransactionsRepository } from './ports/outbound/transactions.repository';

/** Fields required to derive balance and check outbound funds. */
export type AccountFundsContext = {
    readonly id: string;
    readonly currency: CurrencyCode;
    readonly initialBalance: string;
};

/**
 * Derives the account balance and rejects when `amount` would overdraw it.
 *
 * @param transactionsRepository Source of non-deleted account transactions.
 * @param account Account whose funds are checked (id, currency, initial balance).
 * @param amount Positive outbound amount already normalized as a decimal string.
 * @throws {BadRequestException} With `TRANSACTION_INSUFFICIENT_FUNDS` when short.
 */
export async function assertSufficientOutboundFunds(
    transactionsRepository: ITransactionsRepository,
    account: AccountFundsContext,
    amount: string,
): Promise<void> {
    const ledger = await transactionsRepository.findTransactionsForAccount(account.id);
    const currentBalance = AccountBalance.derive(account.initialBalance, account.currency, ledger);

    if (!AccountBalance.hasSufficientFunds(currentBalance, account.currency, amount)) {
        throw new BadRequestException({
            code: TRANSACTION_ERROR_CODES.insufficientFunds,
            message: 'Not enough balance for this transfer or expense',
            details: {},
        });
    }
}
