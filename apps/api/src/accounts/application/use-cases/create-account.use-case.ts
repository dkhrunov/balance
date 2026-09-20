import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Account, ACCOUNT_ERROR_CODES, CreateAccountRequest } from '@balance/contracts/accounts';
import { Money, MoneyValidationError } from '@balance/domain/money';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { ICreateAccountUseCase } from '../ports/inbound/create-account.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

const ACCOUNT_NAME_MAX_LENGTH = 120;

@Injectable()
export class CreateAccountUseCase implements ICreateAccountUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(actorUserId: string, request: CreateAccountRequest): Promise<Account> {
        const name = request.name.trim();

        if (name.length < 1 || name.length > ACCOUNT_NAME_MAX_LENGTH) {
            throw new BadRequestException({
                code: ACCOUNT_ERROR_CODES.validationFailed,
                message: 'Account name must be between 1 and 120 characters',
                details: {},
            });
        }

        let money: Money;

        try {
            money = Money.create(request.currency, request.initialBalance);
        } catch (error) {
            if (error instanceof MoneyValidationError) {
                throw new BadRequestException({
                    code: ACCOUNT_ERROR_CODES.validationFailed,
                    message: error.message,
                    details: {},
                });
            }

            throw error;
        }

        const account = await this.accountsRepository.create({
            name,
            currency: money.currency,
            initialBalance: money.amount,
            actorUserId,
        });

        return toAccountResponse(account);
    }
}
