import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_ERROR_CODES } from '@balance/contracts/auth';
import { GET_USER_IDENTITY_USE_CASE, IGetUserIdentityUseCase } from '../../../users';
import { AuthenticatedSession } from '../models/authenticated-session';
import { ACCESS_TOKEN_SERVICE, IAccessTokenService } from '../ports/outbound/access-token.port';
import { AUTH_CONFIG, IAuthConfig } from '../ports/outbound/auth-config.port';
import { AUTH_SESSIONS_REPOSITORY, IAuthSessionsRepository } from '../ports/outbound/auth-sessions.repository';
import { IRefreshUseCase } from '../ports/inbound/refresh.use-case';
import { RefreshTokenService } from '../services/refresh-token.service';

@Injectable()
export class RefreshUseCase implements IRefreshUseCase {
    public constructor(
        @Inject(GET_USER_IDENTITY_USE_CASE) private readonly getUserIdentity: IGetUserIdentityUseCase,
        @Inject(AUTH_SESSIONS_REPOSITORY) private readonly authSessionsRepository: IAuthSessionsRepository,
        @Inject(ACCESS_TOKEN_SERVICE) private readonly accessToken: IAccessTokenService,
        @Inject(AUTH_CONFIG) private readonly authConfig: IAuthConfig,
        private readonly refreshToken: RefreshTokenService,
    ) {}

    public async execute(refreshToken: string): Promise<AuthenticatedSession> {
        const nextRefreshToken = this.refreshToken.create();
        const rotated = await this.authSessionsRepository.rotate(
            this.refreshToken.createHash(refreshToken),
            this.refreshToken.createHash(nextRefreshToken),
            new Date(Date.now() + this.authConfig.refreshTtl * 1000),
        );

        if (rotated.status !== 'rotated') {
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.unauthenticated,
                message: 'Authentication is required',
                details: {},
            });
        }

        const user = await this.getUserIdentity.execute(rotated.session.userId);

        if (!user) {
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.unauthenticated,
                message: 'Authentication is required',
                details: {},
            });
        }

        return {
            user,
            accessToken: await this.accessToken.sign(user.id, rotated.session.id),
            refreshToken: nextRefreshToken,
        };
    }
}
