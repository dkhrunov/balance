import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_ERROR_CODES, CurrentUserResponse } from '@balance/contracts/auth';
import { GET_USER_IDENTITY_USE_CASE, IGetUserIdentityUseCase } from '../../../users';
import { ACCESS_TOKEN_SERVICE, IAccessTokenService } from '../ports/outbound/access-token.port';
import { AUTH_SESSIONS_REPOSITORY, IAuthSessionsRepository } from '../ports/outbound/auth-sessions.repository';
import { IGetCurrentUserUseCase } from '../ports/inbound/get-current-user.use-case';

@Injectable()
export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
    public constructor(
        @Inject(GET_USER_IDENTITY_USE_CASE)
        private readonly getUserIdentity: IGetUserIdentityUseCase,
        @Inject(AUTH_SESSIONS_REPOSITORY)
        private readonly authSessionsRepository: IAuthSessionsRepository,
        @Inject(ACCESS_TOKEN_SERVICE)
        private readonly accessTokenService: IAccessTokenService,
    ) {}

    public async execute(accessToken: string): Promise<CurrentUserResponse> {
        const claims = await this.accessTokenService.verify(accessToken);

        const isActiveSession = await this.authSessionsRepository.isActive(claims.sid);

        if (!isActiveSession) {
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.unauthenticated,
                message: 'Authentication is required',
                details: {},
            });
        }

        const user = await this.getUserIdentity.execute(claims.sub);

        if (!user) {
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.unauthenticated,
                message: 'Authentication is required',
                details: {},
            });
        }

        return { user };
    }
}
