import { CurrentUserResponse, LoginRequest, LoginResponse } from '@balance/dto/auth';
import { ApiClient } from '../api-client';

export class AuthApi {
    private constructor() {
        /* empty constructor */
    }

    /** Authenticates with email and password; sets session cookies. */
    public static login(credentials: LoginRequest): Promise<LoginResponse> {
        return ApiClient.post<LoginResponse>('/auth/login', credentials);
    }

    /** Returns the current authenticated user, or fails if the session is invalid. */
    public static getCurrentUser(): Promise<CurrentUserResponse> {
        return ApiClient.get<CurrentUserResponse>('/auth/me');
    }

    /** Rotates the refresh token and issues a new access cookie. */
    public static refreshSession(): Promise<void> {
        return ApiClient.post<void>('/auth/refresh');
    }

    /** Clears the server session and cookies. */
    public static logout(): Promise<void> {
        return ApiClient.post<void>('/auth/logout');
    }
}
