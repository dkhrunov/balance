import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AUTH_ERROR_CODES } from '@balance/contracts/auth';
import { AUTH_CONFIG, IAuthConfig } from '../../../../application/ports/outbound/auth-config.port';

@Injectable()
export class CsrfOriginGuard implements CanActivate {
    public constructor(@Inject(AUTH_CONFIG) private readonly authConfig: IAuthConfig) {}

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const origin = request.headers.origin;

        if (origin === this.authConfig.webOrigin) {
            return true;
        }

        throw new ForbiddenException({
            code: AUTH_ERROR_CODES.csrfRejected,
            message: 'Request origin is not allowed',
            details: {},
        });
    }
}
