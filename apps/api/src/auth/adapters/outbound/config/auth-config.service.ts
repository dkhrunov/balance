import { Duration } from '@balance/domain/duration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAuthConfig } from '../../../application/ports/outbound/auth-config.port';

/** Reads auth-related env and exposes timing + transport settings. */
@Injectable()
export class AuthConfigService implements IAuthConfig {
    public readonly secret: string;
    public readonly accessTtl: number;
    public readonly refreshTtl: number;
    public readonly sessionTtl: number;
    public readonly webOrigin: string;
    public readonly useSecureCookies: boolean;

    public constructor(config: ConfigService) {
        this.secret = config.getOrThrow<string>('AUTH_SECRET');

        this.accessTtl = new Duration(config.getOrThrow<string>('AUTH_ACCESS_TTL')).toSeconds();

        this.refreshTtl = new Duration(config.getOrThrow<string>('AUTH_REFRESH_TTL')).toSeconds();

        this.sessionTtl = new Duration(config.getOrThrow<string>('AUTH_SESSION_TTL')).toSeconds();

        this.webOrigin = config.getOrThrow<string>('WEB_ORIGIN');

        this.useSecureCookies = config.get<string>('NODE_ENV') === 'production';

        if (this.accessTtl >= this.refreshTtl) {
            throw new Error('AUTH_ACCESS_TTL must be shorter than AUTH_REFRESH_TTL');
        }

        if (this.refreshTtl > this.sessionTtl) {
            throw new Error('AUTH_REFRESH_TTL must not exceed AUTH_SESSION_TTL');
        }
    }
}
