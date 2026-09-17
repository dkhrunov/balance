import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferences } from '@balance/contracts/users';
import { IUsersRepository, USERS_REPOSITORY } from '../ports/outbound/users.repository';
import { IGetUserPreferencesUseCase } from '../ports/inbound/get-user-preferences.use-case';

@Injectable()
export class GetUserPreferencesUseCase implements IGetUserPreferencesUseCase {
    public constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: IUsersRepository) {}

    public async execute(userId: string): Promise<UserPreferences> {
        const preferences = await this.usersRepository.getPreferences(userId);

        if (!preferences) {
            throw new NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found',
                details: {},
            });
        }

        return preferences;
    }
}
