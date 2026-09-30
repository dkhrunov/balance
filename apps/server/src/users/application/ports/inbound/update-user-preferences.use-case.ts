import { UserPreferences } from '@balance/dto/users';

/** Replaces the authenticated user's persisted UI preferences. */
export interface IUpdateUserPreferencesUseCase {
    execute(userId: string, preferences: UserPreferences): Promise<UserPreferences>;
}

export const UPDATE_USER_PREFERENCES_USE_CASE = Symbol('UPDATE_USER_PREFERENCES_USE_CASE');
