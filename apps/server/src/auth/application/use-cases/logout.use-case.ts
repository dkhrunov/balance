import { Inject, Injectable } from '@nestjs/common';
import { AUTH_CONFIG, IAuthConfig } from '../ports/outbound/auth-config.port';
import { AUTH_SESSIONS_REPOSITORY, IAuthSessionsRepository } from '../ports/outbound/auth-sessions.repository';
import { ILogoutUseCase } from '../ports/inbound/logout.use-case';
import { RefreshTokenService } from '../services/refresh-token.service';

@Injectable()
export class LogoutUseCase implements ILogoutUseCase {
    public constructor(
        @Inject(AUTH_SESSIONS_REPOSITORY) private readonly authSessionsRepository: IAuthSessionsRepository,
        @Inject(AUTH_CONFIG) private readonly authConfig: IAuthConfig,
        private readonly refreshToken: RefreshTokenService,
    ) {}

    public async execute(refreshToken: string | undefined): Promise<void> {
        if (!refreshToken) {
            return;
        }

        const rotated = await this.authSessionsRepository.rotate(
            this.refreshToken.createHash(refreshToken),
            this.refreshToken.createHash(this.refreshToken.create()),
            new Date(Date.now() + this.authConfig.refreshTtl * 1000),
        );

        if (rotated.status === 'rotated') {
            await this.authSessionsRepository.revoke(rotated.session.id);
        }
    }
}
