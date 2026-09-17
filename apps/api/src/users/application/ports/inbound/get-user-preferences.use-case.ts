import { UserPreferences } from '@balance/contracts/users';

/** Loads the authenticated user's persisted UI preferences. */
export interface IGetUserPreferencesUseCase {
    execute(userId: string): Promise<UserPreferences>;
}

export const GET_USER_PREFERENCES_USE_CASE = Symbol('GET_USER_PREFERENCES_USE_CASE');
