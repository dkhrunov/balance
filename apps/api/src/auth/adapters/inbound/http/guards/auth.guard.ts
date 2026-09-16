import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUserResponse } from '@balance/contracts/auth';
import { AuthCookieService } from '../../../outbound/http/auth-cookie.service';
import { GET_CURRENT_USER_USE_CASE, IGetCurrentUserUseCase } from '../../../../application';

export type AuthenticatedRequest = Request & { auth: CurrentUserResponse };

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(
        @Inject(GET_CURRENT_USER_USE_CASE) private readonly getCurrentUserUseCase: IGetCurrentUserUseCase,
        private readonly authCookies: AuthCookieService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const { accessToken } = this.authCookies.read(request);

        const auth = await this.getCurrentUserUseCase.execute(accessToken ?? '');
        (request as AuthenticatedRequest).auth = auth;

        return true;
    }
}
