/** Application view of a persisted auth session (no persistence-only fields). */
export type AuthSession = {
    readonly id: string;
    readonly userId: string;
};

/** Outcome of rotating a refresh token against an existing session. */
export type RefreshSessionResult =
    | { readonly status: 'rotated'; readonly session: AuthSession }
    | { readonly status: 'expired' | 'reused' | 'not-found' };
