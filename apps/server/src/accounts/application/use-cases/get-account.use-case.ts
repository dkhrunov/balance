import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Account, ACCOUNT_ERROR_CODES } from '@balance/dto/accounts';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { IGetAccountUseCase } from '../ports/inbound/get-account.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

@Injectable()
export class GetAccountUseCase implements IGetAccountUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(accountId: string): Promise<Account> {
        const account = await this.accountsRepository.findActiveById(accountId);

        if (!account) {
            throw new NotFoundException({
                code: ACCOUNT_ERROR_CODES.notFound,
                message: 'Account not found',
                details: {},
            });
        }

        return toAccountResponse(account);
    }
}
