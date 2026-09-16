import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import {
    GET_USER_IDENTITY_USE_CASE,
    GetUserIdentityUseCase,
    USERS_REPOSITORY,
    VERIFY_USER_CREDENTIALS_USE_CASE,
    VerifyUserCredentialsUseCase,
} from './application';
import { PgUsersRepository } from './adapters/outbound';

@Module({
    imports: [DatabaseModule],
    providers: [
        { provide: USERS_REPOSITORY, useClass: PgUsersRepository },
        { provide: VERIFY_USER_CREDENTIALS_USE_CASE, useClass: VerifyUserCredentialsUseCase },
        { provide: GET_USER_IDENTITY_USE_CASE, useClass: GetUserIdentityUseCase },
    ],
    exports: [VERIFY_USER_CREDENTIALS_USE_CASE, GET_USER_IDENTITY_USE_CASE],
})
export class UsersModule {}
