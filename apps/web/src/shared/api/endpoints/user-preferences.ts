import { GetUserPreferencesResponse, UpdateUserPreferencesRequest, UserPreferences } from '@balance/dto/users';
import { ApiClient } from '../api-client';

export class UserPreferencesApi {
    private constructor() {
        /* empty constructor */
    }

    /** Loads the authenticated user's UI preferences. */
    public static getUserPreferences(): Promise<GetUserPreferencesResponse> {
        return ApiClient.get<GetUserPreferencesResponse>('/users/me/preferences');
    }

    /** Replaces the authenticated user's UI preferences. */
    public static updateUserPreferences(
        preferences: UpdateUserPreferencesRequest,
    ): Promise<UserPreferences> {
        return ApiClient.put<UserPreferences>('/users/me/preferences', preferences);
    }
}
