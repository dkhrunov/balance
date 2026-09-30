/** Persistence row shape for the `auth_sessions` table. */
export type AuthSessionRecord = {
    readonly id: string;
    readonly familyId: string;
    readonly userId: string;
    readonly refreshTokenHash: string;
    readonly expiresAt: Date;
    readonly absoluteExpiresAt: Date;
    readonly revokedAt: Date | null;
    readonly replacedBySessionId: string | null;
};
