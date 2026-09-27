import { Controller, Get, Inject, Put, Body, UseGuards } from '@nestjs/common';
import {
    GetUserPreferencesResponse,
    UpdateUserPreferencesRequest,
    UserIdentity,
} from '@balance/contracts/users';
import { AuthGuard, CurrentUser, CsrfOriginGuard } from '../../../../auth/adapters/inbound';
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
    public getPreferences(@CurrentUser() user: UserIdentity): Promise<GetUserPreferencesResponse> {
        return this.getUserPreferencesUseCase.execute(user.id);
    }

    @Put('preferences')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public updatePreferences(
        @CurrentUser() user: UserIdentity,
        @Body() body: UpdateUserPreferencesDto,
    ): Promise<GetUserPreferencesResponse> {
        const preferences: UpdateUserPreferencesRequest = {
            locale: body.locale,
            theme: body.theme,
        };

        return this.updateUserPreferencesUseCase.execute(user.id, preferences);
    }
}
