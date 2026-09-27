import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction, TRANSACTION_ERROR_CODES } from '@balance/contracts/transactions';
import { toTransactionResponse } from '../mappers/transaction-response.mapper';
import { IGetTransactionUseCase } from '../ports/inbound/get-transaction.use-case';
import {
    ITransactionsRepository,
    TRANSACTIONS_REPOSITORY,
} from '../ports/outbound/transactions.repository';

@Injectable()
export class GetTransactionUseCase implements IGetTransactionUseCase {
    public constructor(
        @Inject(TRANSACTIONS_REPOSITORY) private readonly transactionsRepository: ITransactionsRepository,
    ) {}

    public async execute(transactionId: string): Promise<Transaction> {
        const transaction = await this.transactionsRepository.findActiveById(transactionId);

        if (!transaction) {
            throw new NotFoundException({
                code: TRANSACTION_ERROR_CODES.notFound,
                message: 'Transaction not found',
                details: {},
            });
        }

        return toTransactionResponse(transaction);
    }
}
