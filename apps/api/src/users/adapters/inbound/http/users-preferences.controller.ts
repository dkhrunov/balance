import { Controller, Get, Inject, Put, Body, Req, UseGuards } from '@nestjs/common';
import {
    GetUserPreferencesResponse,
    UpdateUserPreferencesRequest,
} from '@balance/contracts/users';
import { AuthenticatedRequest, AuthGuard } from '../../../../auth/adapters/inbound/http/guards/auth.guard';
import { CsrfOriginGuard } from '../../../../auth/adapters/inbound/http/guards/csrf-origin.guard';
import {
    GET_USER_PREFERENCES_USE_CASE,
    IGetUserPreferencesUseCase,
    IUpdateUserPreferencesUseCase,
    UPDATE_USER_PREFERENCES_USE_CASE,
} from '../../../application';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Controller('users/me')
export class UsersPreferencesController {
    public constructor(
        @Inject(GET_USER_PREFERENCES_USE_CASE)
        private readonly getUserPreferencesUseCase: IGetUserPreferencesUseCase,
        @Inject(UPDATE_USER_PREFERENCES_USE_CASE)
        private readonly updateUserPreferencesUseCase: IUpdateUserPreferencesUseCase,
    ) {}

    @Get('preferences')
    @UseGuards(AuthGuard)
    public getPreferences(@Req() request: AuthenticatedRequest): Promise<GetUserPreferencesResponse> {
        return this.getUserPreferencesUseCase.execute(request.auth.user.id);
    }

    @Put('preferences')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public updatePreferences(
        @Req() request: AuthenticatedRequest,
        @Body() body: UpdateUserPreferencesDto,
    ): Promise<GetUserPreferencesResponse> {
        const preferences: UpdateUserPreferencesRequest = {
            locale: body.locale,
            theme: body.theme,
        };

        return this.updateUserPreferencesUseCase.execute(request.auth.user.id, preferences);
    }
}

