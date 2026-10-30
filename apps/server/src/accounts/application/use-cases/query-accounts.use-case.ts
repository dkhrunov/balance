import { Inject, Injectable } from '@nestjs/common';
import { QueryAccountsResponse } from '@balance/dto/accounts';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { IQueryAccountsUseCase } from '../ports/inbound/query-accounts.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

@Injectable()
export class QueryAccountsUseCase implements IQueryAccountsUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(): Promise<QueryAccountsResponse> {
        const accounts = await this.accountsRepository.findActive();

        return { items: accounts.map(toAccountResponse) };
    }
}
