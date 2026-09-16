import { Inject, Injectable } from '@nestjs/common';
import { LoginRequest } from '@balance/contracts/auth';
import { UserIdentity } from '@balance/contracts/users';
import { IVerifyUserCredentialsUseCase, VERIFY_USER_CREDENTIALS_USE_CASE } from '../../../users';
import { AuthenticatedSession } from '../models/authenticated-session';
import { ACCESS_TOKEN_SERVICE, IAccessTokenService } from '../ports/outbound/access-token.port';
import { AUTH_CONFIG, IAuthConfig } from '../ports/outbound/auth-config.port';
import { AUTH_SESSIONS_REPOSITORY, IAuthSessionsRepository } from '../ports/outbound/auth-sessions.repository';
import { ILoginUseCase } from '../ports/inbound/login.use-case';
import { RefreshTokenService } from '../services/refresh-token.service';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
    public constructor(
        @Inject(VERIFY_USER_CREDENTIALS_USE_CASE)
        private readonly verifyUserCredentials: IVerifyUserCredentialsUseCase,
        @Inject(AUTH_SESSIONS_REPOSITORY)
        private readonly authSessionsRepository: IAuthSessionsRepository,
        @Inject(ACCESS_TOKEN_SERVICE)
        private readonly accessToken: IAccessTokenService,
        @Inject(AUTH_CONFIG)
        private readonly authConfig: IAuthConfig,
        private readonly refreshToken: RefreshTokenService,
    ) {}

    public async execute(input: LoginRequest): Promise<AuthenticatedSession> {
        const user = await this.verifyUserCredentials.execute(input);

        return this.createSession(user);
    }

    private async createSession(user: UserIdentity): Promise<AuthenticatedSession> {
        const refreshToken = this.refreshToken.create();
        const refreshTokenHash = this.refreshToken.createHash(refreshToken);
        const refreshExpiresAt = new Date(Date.now() + this.authConfig.refreshTtl * 1000);
        const absoluteExpiresAt = new Date(Date.now() + this.authConfig.sessionTtl * 1000);

        const session = await this.authSessionsRepository.create(
            user.id,
            refreshTokenHash,
            refreshExpiresAt,
            absoluteExpiresAt,
        );

        return {
            user,
            accessToken: await this.accessToken.sign(user.id, session.id),
            refreshToken,
        };
    }
}
