import { CurrentUserResponse, LoginRequest, LoginResponse } from '@balance/contracts/auth';
import { ApiClient } from '../api-request';

/** Authenticates with email and password; sets session cookies. */
export function login(credentials: LoginRequest): Promise<LoginResponse> {
    return ApiClient.post<LoginResponse>('/auth/login', credentials);
}

/** Returns the current authenticated user, or fails if the session is invalid. */
export function getCurrentUser(): Promise<CurrentUserResponse> {
    return ApiClient.get<CurrentUserResponse>('/auth/me');
}

/** Rotates the refresh token and issues a new access cookie. */
export function refreshSession(): Promise<void> {
    return ApiClient.post<void>('/auth/refresh');
}

/** Clears the server session and cookies. */
export function logout(): Promise<void> {
    return ApiClient.post<void>('/auth/logout');
}
