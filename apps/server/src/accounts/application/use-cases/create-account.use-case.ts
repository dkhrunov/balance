import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
    Account,
    ACCOUNT_ERROR_CODES,
    ACCOUNT_ICON_MAX_LENGTH,
    ACCOUNT_ICON_MIN_LENGTH,
    ACCOUNT_NAME_MAX_LENGTH,
    ACCOUNT_NAME_MIN_LENGTH,
    CreateAccountRequest,
    DEFAULT_ACCOUNT_ICON,
} from '@balance/dto/accounts';
import { Money, MoneyValidationError } from '@balance/domain/money';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { ICreateAccountUseCase } from '../ports/inbound/create-account.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

@Injectable()
export class CreateAccountUseCase implements ICreateAccountUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(actorUserId: string, request: CreateAccountRequest): Promise<Account> {
        const name = request.name.trim();

        if (name.length < ACCOUNT_NAME_MIN_LENGTH || name.length > ACCOUNT_NAME_MAX_LENGTH) {
            throw new BadRequestException({
                code: ACCOUNT_ERROR_CODES.validationFailed,
                message: `Account name must be between ${ACCOUNT_NAME_MIN_LENGTH} and ${ACCOUNT_NAME_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const icon = (request.icon ?? DEFAULT_ACCOUNT_ICON).trim();

        if (icon.length < ACCOUNT_ICON_MIN_LENGTH || icon.length > ACCOUNT_ICON_MAX_LENGTH) {
            throw new BadRequestException({
                code: ACCOUNT_ERROR_CODES.validationFailed,
                message: `Account icon must be between ${ACCOUNT_ICON_MIN_LENGTH} and ${ACCOUNT_ICON_MAX_LENGTH} characters`,
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
            icon,
            currency: money.currency,
            initialBalance: money.amount,
            actorUserId,
        });

        return toAccountResponse(account);
    }
}
