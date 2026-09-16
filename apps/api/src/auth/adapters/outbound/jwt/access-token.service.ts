import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR_CODES } from '@balance/contracts/auth';
import { AccessTokenClaims } from '../../../application/models/access-token-claims';
import { IAccessTokenService } from '../../../application/ports/outbound/access-token.port';
import { AUTH_CONFIG, IAuthConfig } from '../../../application/ports/outbound/auth-config.port';

/** Signs and verifies JWT access tokens for authenticated sessions. */
@Injectable()
export class AccessTokenService implements IAccessTokenService {
    public constructor(
        private readonly jwtService: JwtService,
        @Inject(AUTH_CONFIG) private readonly authConfig: IAuthConfig,
    ) {}

    /** Issues a signed access token bound to a user and session. */
    public sign(userId: string, sessionId: string): Promise<string> {
        return this.jwtService.signAsync(
            { sub: userId, sid: sessionId },
            {
                secret: this.authConfig.secret,
                expiresIn: this.authConfig.accessTtl,
            },
        );
    }

    /** Verifies an access token and returns its claims. */
    public async verify(accessToken: string): Promise<AccessTokenClaims> {
        try {
            return await this.jwtService.verifyAsync<AccessTokenClaims>(accessToken, {
                secret: this.authConfig.secret,
            });
        } catch {
            throw new UnauthorizedException({
                code: AUTH_ERROR_CODES.unauthenticated,
                message: 'Authentication is required',
                details: {},
            });
        }
    }
}
