import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import {
    GET_USER_IDENTITY_USE_CASE,
    GET_USER_PREFERENCES_USE_CASE,
    GetUserIdentityUseCase,
    GetUserPreferencesUseCase,
    USERS_REPOSITORY,
    UPDATE_USER_PREFERENCES_USE_CASE,
    UpdateUserPreferencesUseCase,
    VERIFY_USER_CREDENTIALS_USE_CASE,
    VerifyUserCredentialsUseCase,
} from './application';
import { PgUsersRepository } from './adapters/outbound';
import { UsersPreferencesController } from './adapters/inbound';

@Module({
    imports: [DatabaseModule, forwardRef(() => AuthModule)],
    controllers: [UsersPreferencesController],
    providers: [
        { provide: USERS_REPOSITORY, useClass: PgUsersRepository },
        { provide: VERIFY_USER_CREDENTIALS_USE_CASE, useClass: VerifyUserCredentialsUseCase },
        { provide: GET_USER_IDENTITY_USE_CASE, useClass: GetUserIdentityUseCase },
        { provide: GET_USER_PREFERENCES_USE_CASE, useClass: GetUserPreferencesUseCase },
        { provide: UPDATE_USER_PREFERENCES_USE_CASE, useClass: UpdateUserPreferencesUseCase },
    ],
    exports: [
        VERIFY_USER_CREDENTIALS_USE_CASE,
        GET_USER_IDENTITY_USE_CASE,
        GET_USER_PREFERENCES_USE_CASE,
        UPDATE_USER_PREFERENCES_USE_CASE,
    ],
})
export class UsersModule {}
