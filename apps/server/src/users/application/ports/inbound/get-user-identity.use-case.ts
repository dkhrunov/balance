import { UserIdentity } from '@balance/dto/users';

/** Loads a public user identity by id. */
export interface IGetUserIdentityUseCase {
    execute(userId: string): Promise<UserIdentity | null>;
}

export const GET_USER_IDENTITY_USE_CASE = Symbol('GET_USER_IDENTITY_USE_CASE');
