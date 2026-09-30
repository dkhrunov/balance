import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    Account,
    ACCOUNT_ERROR_CODES,
    ACCOUNT_ICON_MAX_LENGTH,
    ACCOUNT_ICON_MIN_LENGTH,
    ACCOUNT_NAME_MAX_LENGTH,
    ACCOUNT_NAME_MIN_LENGTH,
    UpdateAccountRequest,
} from '@balance/dto/accounts';
import { toAccountResponse } from '../mappers/account-response.mapper';
import { IUpdateAccountUseCase } from '../ports/inbound/update-account.use-case';
import { ACCOUNTS_REPOSITORY, IAccountsRepository } from '../ports/outbound/accounts.repository';

@Injectable()
export class UpdateAccountUseCase implements IUpdateAccountUseCase {
    public constructor(@Inject(ACCOUNTS_REPOSITORY) private readonly accountsRepository: IAccountsRepository) {}

    public async execute(actorUserId: string, accountId: string, request: UpdateAccountRequest): Promise<Account> {
        const name = request.name.trim();

        if (name.length < ACCOUNT_NAME_MIN_LENGTH || name.length > ACCOUNT_NAME_MAX_LENGTH) {
            throw new BadRequestException({
                code: ACCOUNT_ERROR_CODES.validationFailed,
                message: `Account name must be between ${ACCOUNT_NAME_MIN_LENGTH} and ${ACCOUNT_NAME_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const icon = request.icon.trim();

        if (icon.length < ACCOUNT_ICON_MIN_LENGTH || icon.length > ACCOUNT_ICON_MAX_LENGTH) {
            throw new BadRequestException({
                code: ACCOUNT_ERROR_CODES.validationFailed,
                message: `Account icon must be between ${ACCOUNT_ICON_MIN_LENGTH} and ${ACCOUNT_ICON_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const result = await this.accountsRepository.updateActive({
            id: accountId,
            name,
            icon,
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
