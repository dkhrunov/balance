import { LoginRequest } from '@balance/dto/auth';
import { AuthenticatedSession } from '../../models/authenticated-session';

/** Authenticates credentials and starts a new session. */
export interface ILoginUseCase {
    execute(input: LoginRequest): Promise<AuthenticatedSession>;
}

export const LOGIN_USE_CASE = Symbol('LOGIN_USE_CASE');
