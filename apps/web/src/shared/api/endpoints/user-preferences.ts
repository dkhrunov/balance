import {
    GetUserPreferencesResponse,
    UpdateUserPreferencesRequest,
    UserPreferences,
} from '@balance/contracts/users';
import { ApiClient } from '../api-request';

/** Loads the authenticated user's UI preferences. */
export function getUserPreferences(): Promise<GetUserPreferencesResponse> {
    return ApiClient.get<GetUserPreferencesResponse>('/users/me/preferences');
}

/** Replaces the authenticated user's UI preferences. */
export function updateUserPreferences(
    preferences: UpdateUserPreferencesRequest,
): Promise<UserPreferences> {
    return ApiClient.put<UserPreferences>('/users/me/preferences', preferences);
}
