import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferences } from '@balance/contracts/users';
import { IUsersRepository, USERS_REPOSITORY } from '../ports/outbound/users.repository';
import { IUpdateUserPreferencesUseCase } from '../ports/inbound/update-user-preferences.use-case';

@Injectable()
export class UpdateUserPreferencesUseCase implements IUpdateUserPreferencesUseCase {
    public constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: IUsersRepository) {}

    public async execute(userId: string, preferences: UserPreferences): Promise<UserPreferences> {
        const updated = await this.usersRepository.updatePreferences(userId, preferences);

        if (!updated) {
            throw new NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found',
                details: {},
            });
        }

        return updated;
    }
}
