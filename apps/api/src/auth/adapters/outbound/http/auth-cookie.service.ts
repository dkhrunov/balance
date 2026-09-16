import { Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AUTH_CONFIG, IAuthConfig } from '../../../application/ports/outbound/auth-config.port';

/** HttpOnly cookie transport for access and refresh tokens. */
@Injectable()
export class AuthCookieService {
    private readonly ACCESS_COOKIE = 'balance_access';
    private readonly REFRESH_COOKIE = 'balance_refresh';

    public constructor(@Inject(AUTH_CONFIG) private readonly config: IAuthConfig) {}

    /** Reads a named cookie value from the incoming request. */
    public read(request: Request): { accessToken?: string; refreshToken?: string } {
        const cookieHeader = request.headers.cookie;

        if (!cookieHeader) {
            return { accessToken: '', refreshToken: '' };
        }

        const result: { accessToken?: string; refreshToken?: string } = {
            accessToken: undefined,
            refreshToken: undefined,
        };

        for (const part of cookieHeader.split(';')) {
            const [name, ...value] = part.trim().split('=');

            if (name === this.ACCESS_COOKIE) {
                result.accessToken = decodeURIComponent(value.join('='));
            }

            if (name === this.REFRESH_COOKIE) {
                result.refreshToken = decodeURIComponent(value.join('='));
            }
        }

        return result;
    }

    /** Sets access and refresh token cookies on the response. */
    public set(response: Response, accessToken: string, refreshToken: string): void {
        response.cookie(this.ACCESS_COOKIE, accessToken, {
            httpOnly: true,
            secure: this.config.useSecureCookies,
            sameSite: 'strict',
            path: '/api',
            maxAge: this.config.accessTtl * 1000,
        });

        response.cookie(this.REFRESH_COOKIE, refreshToken, {
            httpOnly: true,
            secure: this.config.useSecureCookies,
            sameSite: 'strict',
            path: '/api/auth',
            maxAge: this.config.refreshTtl * 1000,
        });
    }

    /** Clears access and refresh token cookies from the response. */
    public clear(response: Response): void {
        response.clearCookie(this.ACCESS_COOKIE, {
            httpOnly: true,
            secure: this.config.useSecureCookies,
            sameSite: 'strict',
            path: '/api',
        });

        response.clearCookie(this.REFRESH_COOKIE, {
            httpOnly: true,
            secure: this.config.useSecureCookies,
            sameSite: 'strict',
            path: '/api/auth',
        });
    }
}
