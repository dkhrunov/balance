import { Inject, Injectable } from '@nestjs/common';
import { UserIdentity } from '@balance/contracts/users';
import { toUserIdentity } from '../mappers/user-response.mapper';
import { IUsersRepository, USERS_REPOSITORY } from '../ports/outbound/users.repository';
import { IGetUserIdentityUseCase } from '../ports/inbound/get-user-identity.use-case';

@Injectable()
export class GetUserIdentityUseCase implements IGetUserIdentityUseCase {
    public constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: IUsersRepository) {}

    public async execute(userId: string): Promise<UserIdentity | null> {
        const user = await this.usersRepository.findById(userId);

        return user ? toUserIdentity(user) : null;
    }
}
