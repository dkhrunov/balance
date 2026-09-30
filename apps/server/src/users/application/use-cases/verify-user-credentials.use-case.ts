import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { AUTH_ERROR_CODES, LoginRequest } from '@balance/contracts/auth';
import { UserIdentity } from '@balance/contracts/users';
import { toUserIdentity } from '../mappers/user-response.mapper';
import { IUsersRepository, USERS_REPOSITORY } from '../ports/outbound/users.repository';
import { IVerifyUserCredentialsUseCase } from '../ports/inbound/verify-user-credentials.use-case';

@Injectable()
export class VerifyUserCredentialsUseCase implements IVerifyUserCredentialsUseCase {
    public constructor(@Inject(USERS_REPOSITORY) private readonly usersRepository: IUsersRepository) {}

    public async execute(credentials: LoginRequest): Promise<UserIdentity> {
        const user = await this.usersRepository.findByEmail(credentials.email);
        const passwordMatches = user ? await argon2.verify(user.passwordHash, credentials.password) : false;

        if (!user || !passwordMatches) {
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.invalidCredentials,
                message: 'Invalid email or password',
                details: {},
            });
        }

        return toUserIdentity(user);
    }
}
