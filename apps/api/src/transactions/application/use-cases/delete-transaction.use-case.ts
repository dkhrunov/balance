import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    DeleteTransactionRequest,
    Transaction,
    TRANSACTION_ERROR_CODES,
} from '@balance/contracts/transactions';
import { toTransactionResponse } from '../mappers/transaction-response.mapper';
import { IDeleteTransactionUseCase } from '../ports/inbound/delete-transaction.use-case';
import {
    ITransactionsRepository,
    TRANSACTIONS_REPOSITORY,
} from '../ports/outbound/transactions.repository';

@Injectable()
export class DeleteTransactionUseCase implements IDeleteTransactionUseCase {
    public constructor(
        @Inject(TRANSACTIONS_REPOSITORY) private readonly transactionsRepository: ITransactionsRepository,
    ) {}

    public async execute(
        actorUserId: string,
        transactionId: string,
        request: DeleteTransactionRequest,
    ): Promise<Transaction> {
        const result = await this.transactionsRepository.softDeleteActive({
            id: transactionId,
            expectedVersion: request.version,
            actorUserId,
        });

        if (result.kind === 'not_found') {
            throw new NotFoundException({
                code: TRANSACTION_ERROR_CODES.notFound,
                message: 'Transaction not found',
                details: {},
            });
        }

        if (result.kind === 'version_conflict') {
            throw new ConflictException({
                code: TRANSACTION_ERROR_CODES.versionConflict,
                message: 'Transaction was modified by another request',
                details: {},
            });
        }

        return toTransactionResponse(result.transaction);
    }
}
