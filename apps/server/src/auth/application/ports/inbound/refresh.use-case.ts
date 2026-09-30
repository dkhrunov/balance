import { AuthenticatedSession } from '../../models/authenticated-session';

/** Rotates a refresh token and issues a new authenticated session. */
export interface IRefreshUseCase {
    execute(refreshToken: string): Promise<AuthenticatedSession>;
}

export const REFRESH_USE_CASE = Symbol('REFRESH_USE_CASE');
