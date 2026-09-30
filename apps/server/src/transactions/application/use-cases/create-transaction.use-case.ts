import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { GET_ACCOUNT_USE_CASE, IGetAccountUseCase } from '../../../accounts';
import { GET_CATEGORY_USE_CASE, IGetCategoryUseCase } from '../../../categories';
import {
    CreateTransactionRequest,
    SIMPLE_TRANSACTION_TYPES,
    TRANSACTION_DESCRIPTION_MAX_LENGTH,
    TRANSACTION_ERROR_CODES,
    Transaction,
} from '@balance/contracts/transactions';
import { Money, MoneyValidationError } from '@balance/domain/money';
import { toTransactionResponse } from '../mappers/transaction-response.mapper';
import { ICreateTransactionUseCase } from '../ports/inbound/create-transaction.use-case';
import { ITransactionsRepository, TRANSACTIONS_REPOSITORY } from '../ports/outbound/transactions.repository';
import { isIsoDate } from '../transaction-cursor';

@Injectable()
export class CreateTransactionUseCase implements ICreateTransactionUseCase {
    public constructor(
        @Inject(TRANSACTIONS_REPOSITORY) private readonly transactionsRepository: ITransactionsRepository,
        @Inject(GET_ACCOUNT_USE_CASE) private readonly getAccountUseCase: IGetAccountUseCase,
        @Inject(GET_CATEGORY_USE_CASE) private readonly getCategoryUseCase: IGetCategoryUseCase,
    ) {}

    public async execute(actorUserId: string, request: CreateTransactionRequest): Promise<Transaction> {
        if (!(SIMPLE_TRANSACTION_TYPES as readonly string[]).includes(request.type)) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: `Transaction type must be ${SIMPLE_TRANSACTION_TYPES.join(' or ')}`,
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

        const account = await this.getAccountUseCase.execute(request.accountId);

        if (account.currency !== money.currency) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.currencyMismatch,
                message: 'Transaction currency must match the account currency',
                details: {},
            });
        }

        const category = await this.getCategoryUseCase.execute(request.categoryId);

        if (category.type !== request.type) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.categoryTypeMismatch,
                message: 'Category type must match the transaction type',
                details: {},
            });
        }

        const transaction = await this.transactionsRepository.create({
            type: request.type,
            accountId: account.id,
            categoryId: category.id,
            amount: money.amount,
            currency: money.currency,
            transactionDate: request.transactionDate,
            description,
            actorUserId,
        });

        return toTransactionResponse(transaction);
    }
}
