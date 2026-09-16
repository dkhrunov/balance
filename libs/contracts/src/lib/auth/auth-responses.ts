import { UserIdentity } from '../users';

/** Public result returned after a successful login. Tokens are set in HttpOnly cookies. */
export interface LoginResponse {
    readonly user: UserIdentity;
}

/** Public result returned by the current-user identity endpoint. */
export interface CurrentUserResponse {
    readonly user: UserIdentity;
}
