import { UserAccount } from '../../models/user-account';
import { UserPreferencesModel } from '../../models/user-preferences';

/** Port for loading and updating persisted users. */
export interface IUsersRepository {
    findByEmail(email: string): Promise<UserAccount | null>;
    findById(id: string): Promise<UserAccount | null>;
    getPreferences(userId: string): Promise<UserPreferencesModel | null>;
    updatePreferences(
        userId: string,
        preferences: UserPreferencesModel,
    ): Promise<UserPreferencesModel | null>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
