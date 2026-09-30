import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserIdentity } from '@balance/contracts/users';
import { AuthenticatedRequest } from '../guards/auth.guard';

/**
 * Nest parameter decorator that resolves the authenticated user
 * from `request.auth.user` (set by {@link AuthGuard}).
 *
 * @returns Authenticated user
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserIdentity => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.auth.user;
});
