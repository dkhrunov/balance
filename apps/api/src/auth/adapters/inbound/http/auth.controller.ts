import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUserResponse, LoginResponse } from '@balance/contracts/auth';
import { AuthCookieService } from '../../outbound/http/auth-cookie.service';
import {
    ILoginUseCase,
    LOGIN_USE_CASE,
    ILogoutUseCase,
    LOGOUT_USE_CASE,
    IRefreshUseCase,
    REFRESH_USE_CASE,
} from '../../../application';
import { CsrfOriginGuard } from './guards/csrf-origin.guard';
import { AuthenticatedRequest, AuthGuard } from './guards/auth.guard';
import { LoginRequestDto } from './dto/login-request.dto';

@Controller('auth')
export class AuthController {
    public constructor(
        @Inject(LOGIN_USE_CASE) private readonly loginUseCase: ILoginUseCase,
        @Inject(REFRESH_USE_CASE) private readonly refreshUseCase: IRefreshUseCase,
        @Inject(LOGOUT_USE_CASE) private readonly logoutUseCase: ILogoutUseCase,
        private readonly authCookies: AuthCookieService,
    ) {}

    @Post('login')
    @UseGuards(CsrfOriginGuard)
    public async login(
        @Body() body: LoginRequestDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<LoginResponse> {
        const session = await this.loginUseCase.execute(body);
        this.authCookies.set(response, session.accessToken, session.refreshToken);

        return { user: session.user };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(CsrfOriginGuard)
    public async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
        const { refreshToken } = this.authCookies.read(request);
        const session = await this.refreshUseCase.execute(refreshToken ?? '');
        this.authCookies.set(response, session.accessToken, session.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(CsrfOriginGuard)
    public async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
        const { refreshToken } = this.authCookies.read(request);
        await this.logoutUseCase.execute(refreshToken);
        this.authCookies.clear(response);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    public currentUser(@Req() request: AuthenticatedRequest): CurrentUserResponse {
        return request.auth;
    }
}
