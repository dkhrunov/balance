/** Revokes the session associated with a refresh token. */
export interface ILogoutUseCase {
    execute(refreshToken: string | undefined): Promise<void>;
}

export const LOGOUT_USE_CASE = Symbol('LOGOUT_USE_CASE');
