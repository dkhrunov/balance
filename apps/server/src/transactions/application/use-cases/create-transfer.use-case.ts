import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { GET_ACCOUNT_USE_CASE, IGetAccountUseCase } from '../../../accounts';
import {
    CreateTransferRequest,
    CreateTransferResponse,
    TRANSACTION_DESCRIPTION_MAX_LENGTH,
    TRANSACTION_ERROR_CODES,
} from '@balance/dto/transactions';
import { Money, MoneyValidationError } from '@balance/domain/money';
import { toTransactionResponse } from '../mappers/transaction-response.mapper';
import { ICreateTransferUseCase } from '../ports/inbound/create-transfer.use-case';
import { ITransactionsRepository, TRANSACTIONS_REPOSITORY } from '../ports/outbound/transactions.repository';
import { isIsoDate } from '../transaction-cursor';

@Injectable()
export class CreateTransferUseCase implements ICreateTransferUseCase {
    public constructor(
        @Inject(TRANSACTIONS_REPOSITORY) private readonly transactionsRepository: ITransactionsRepository,
        @Inject(GET_ACCOUNT_USE_CASE) private readonly getAccountUseCase: IGetAccountUseCase,
    ) {}

    public async execute(actorUserId: string, request: CreateTransferRequest): Promise<CreateTransferResponse> {
        if (request.fromAccountId === request.toAccountId) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.sameAccount,
                message: 'Transfer requires two different accounts',
                details: {},
            });
        }

        if (!isIsoDate(request.transactionDate)) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: 'transactionDate must be a valid YYYY-MM-DD date',
                details: {},
            });
        }

        const description = (request.description ?? '').trim();

        if (description.length > TRANSACTION_DESCRIPTION_MAX_LENGTH) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: `Description must be at most ${TRANSACTION_DESCRIPTION_MAX_LENGTH} characters`,
                details: {},
            });
        }

        let money: Money;

        try {
            money = Money.create(request.currency, request.amount);
        } catch (error) {
            if (error instanceof MoneyValidationError) {
                throw new BadRequestException({
                    code: TRANSACTION_ERROR_CODES.validationFailed,
                    message: error.message,
                    details: {},
                });
            }

            throw error;
        }

        if (money.amount.startsWith('-') || money.amount === '0' || money.amount === '0.00') {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: 'Amount must be a positive decimal value',
                details: {},
            });
        }

        const [fromAccount, toAccount] = await Promise.all([
            this.getAccountUseCase.execute(request.fromAccountId),
            this.getAccountUseCase.execute(request.toAccountId),
        ]);

        if (fromAccount.currency !== money.currency || toAccount.currency !== money.currency) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.currencyMismatch,
                message: 'Transfer currency must match both account currencies; FX is not supported',
                details: {},
            });
        }

        if (fromAccount.currency !== toAccount.currency) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.currencyMismatch,
                message: 'Transfer requires both accounts to use the same currency; FX is not supported',
                details: {},
            });
        }

        const pair = await this.transactionsRepository.createTransfer({
            fromAccountId: fromAccount.id,
            toAccountId: toAccount.id,
            amount: money.amount,
            currency: money.currency,
            transactionDate: request.transactionDate,
            description,
            actorUserId,
        });

        return {
            transferGroupId: pair.transferGroupId,
            out: toTransactionResponse(pair.out),
            in: toTransactionResponse(pair.in),
        };
    }
}
