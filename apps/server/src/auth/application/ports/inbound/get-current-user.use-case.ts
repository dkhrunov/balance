import { CurrentUserResponse } from '@balance/contracts/auth';

/** Resolves the current user from an access token. */
export interface IGetCurrentUserUseCase {
    execute(accessToken: string): Promise<CurrentUserResponse>;
}

export const GET_CURRENT_USER_USE_CASE = Symbol('GET_CURRENT_USER_USE_CASE');
