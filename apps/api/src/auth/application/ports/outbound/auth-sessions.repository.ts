import { AuthSession, RefreshSessionResult } from '../../models/auth-session';

/** Port for auth session persistence and rotation. */
export interface IAuthSessionsRepository {
    create(
        userId: string,
        refreshTokenHash: string,
        refreshExpiresAt: Date,
        absoluteExpiresAt: Date,
    ): Promise<AuthSession>;

    rotate(
        presentedTokenHash: string,
        newTokenHash: string,
        refreshExpiresAt: Date,
    ): Promise<RefreshSessionResult>;

    revoke(sessionId: string): Promise<void>;

    isActive(sessionId: string): Promise<boolean>;
}

export const AUTH_SESSIONS_REPOSITORY = Symbol('AUTH_SESSIONS_REPOSITORY');
