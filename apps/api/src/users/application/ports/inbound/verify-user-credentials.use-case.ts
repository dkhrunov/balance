import { LoginRequest } from '@balance/contracts/auth';
import { UserIdentity } from '@balance/contracts/users';

/** Verifies login credentials and returns a safe user identity. */
export interface IVerifyUserCredentialsUseCase {
    execute(credentials: LoginRequest): Promise<UserIdentity>;
}

export const VERIFY_USER_CREDENTIALS_USE_CASE = Symbol('VERIFY_USER_CREDENTIALS_USE_CASE');
