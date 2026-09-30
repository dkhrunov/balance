import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Account, ACCOUNT_ERROR_CODES, DeleteAccountRequest } from '@balance/contracts/accounts';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { IDeleteAccountUseCase } from '../ports/inbound/delete-account.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

@Injectable()
export class DeleteAccountUseCase implements IDeleteAccountUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(actorUserId: string, accountId: string, request: DeleteAccountRequest): Promise<Account> {
        const result = await this.accountsRepository.softDeleteActive({
            id: accountId,
            expectedVersion: request.version,
            actorUserId,
        });

        if (result.kind === 'not_found') {
            throw new NotFoundException({
                code: ACCOUNT_ERROR_CODES.notFound,
                message: 'Account not found',
                details: {},
            });
        }

        if (result.kind === 'version_conflict') {
            throw new ConflictException({
                code: ACCOUNT_ERROR_CODES.versionConflict,
                message: 'Account was modified by another request',
                details: {},
            });
        }

        return toAccountResponse(result.account);
    }
}
