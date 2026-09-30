import { Inject, Injectable } from '@nestjs/common';
import { ListAccountsResponse } from '@balance/dto/accounts';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { IListAccountsUseCase } from '../ports/inbound/list-accounts.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

@Injectable()
export class ListAccountsUseCase implements IListAccountsUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(): Promise<ListAccountsResponse> {
        const accounts = await this.accountsRepository.listActive();

        return { items: accounts.map(toAccountResponse) };
    }
}
