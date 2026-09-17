import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import {
    ACCESS_TOKEN_SERVICE,
    AUTH_CONFIG,
    AUTH_SESSIONS_REPOSITORY,
    GET_CURRENT_USER_USE_CASE,
    GetCurrentUserUseCase,
    LOGIN_USE_CASE,
    LoginUseCase,
    LOGOUT_USE_CASE,
    LogoutUseCase,
    REFRESH_USE_CASE,
    RefreshUseCase,
    RefreshTokenService,
} from './application';
import { AuthController, AuthGuard, CsrfOriginGuard } from './adapters/inbound';
import {
    AccessTokenService,
    AuthConfigService,
    AuthCookieService,
    PgAuthSessionsRepository,
} from './adapters/outbound';

@Module({
    imports: [JwtModule.register({}), DatabaseModule, forwardRef(() => UsersModule)],
    controllers: [AuthController],
    providers: [
        AuthCookieService,
        RefreshTokenService,
        { provide: AUTH_CONFIG, useClass: AuthConfigService },
        { provide: ACCESS_TOKEN_SERVICE, useClass: AccessTokenService },
        { provide: AUTH_SESSIONS_REPOSITORY, useClass: PgAuthSessionsRepository },
        { provide: LOGIN_USE_CASE, useClass: LoginUseCase },
        { provide: REFRESH_USE_CASE, useClass: RefreshUseCase },
        { provide: LOGOUT_USE_CASE, useClass: LogoutUseCase },
        { provide: GET_CURRENT_USER_USE_CASE, useClass: GetCurrentUserUseCase },
        CsrfOriginGuard,
        AuthGuard,
    ],
    exports: [
        AuthGuard,
        CsrfOriginGuard,
        AuthCookieService,
        AUTH_CONFIG,
        GET_CURRENT_USER_USE_CASE,
    ],
})
export class AuthModule {}
