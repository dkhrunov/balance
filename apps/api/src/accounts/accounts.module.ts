import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import {
    ACCOUNTS_REPOSITORY,
    CREATE_ACCOUNT_USE_CASE,
    CreateAccountUseCase,
    DELETE_ACCOUNT_USE_CASE,
    DeleteAccountUseCase,
    GET_ACCOUNT_USE_CASE,
    GetAccountUseCase,
    LIST_ACCOUNTS_USE_CASE,
    ListAccountsUseCase,
    UPDATE_ACCOUNT_USE_CASE,
    UpdateAccountUseCase,
} from './application';
import { AccountsController } from './adapters/inbound';
import { PgAccountsRepository } from './adapters/outbound';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [AccountsController],
    providers: [
        { provide: ACCOUNTS_REPOSITORY, useClass: PgAccountsRepository },
        { provide: LIST_ACCOUNTS_USE_CASE, useClass: ListAccountsUseCase },
        { provide: GET_ACCOUNT_USE_CASE, useClass: GetAccountUseCase },
        { provide: CREATE_ACCOUNT_USE_CASE, useClass: CreateAccountUseCase },
        { provide: UPDATE_ACCOUNT_USE_CASE, useClass: UpdateAccountUseCase },
        { provide: DELETE_ACCOUNT_USE_CASE, useClass: DeleteAccountUseCase },
    ],
    exports: [
        LIST_ACCOUNTS_USE_CASE,
        GET_ACCOUNT_USE_CASE,
        CREATE_ACCOUNT_USE_CASE,
        UPDATE_ACCOUNT_USE_CASE,
        DELETE_ACCOUNT_USE_CASE,
    ],
})
export class AccountsModule {}
