import { UserIdentity } from '@balance/contracts/users';

/** Application result of a successful authentication flow. */
export type AuthenticatedSession = {
    readonly user: UserIdentity;
    readonly accessToken: string;
    readonly refreshToken: string;
};
