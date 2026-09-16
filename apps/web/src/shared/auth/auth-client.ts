import { CurrentUserResponse, LoginRequest, LoginResponse } from '@balance/contracts/auth';
import { ApiClient } from '../api';

export function login(credentials: LoginRequest): Promise<LoginResponse> {
    return ApiClient.post<LoginResponse>('/auth/login', credentials);
}

export function getCurrentUser(): Promise<CurrentUserResponse> {
    return ApiClient.get<CurrentUserResponse>('/auth/me');
}

export function refreshSession(): Promise<void> {
    return ApiClient.post<void>('/auth/refresh');
}

export function logout(): Promise<void> {
    return ApiClient.post<void>('/auth/logout');
}
