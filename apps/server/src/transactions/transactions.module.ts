import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { AccountsModule } from '../accounts';
import { CategoriesModule } from '../categories';
import {
    CREATE_TRANSACTION_USE_CASE,
    CREATE_TRANSFER_USE_CASE,
    CreateTransactionUseCase,
    CreateTransferUseCase,
    DELETE_TRANSACTION_USE_CASE,
    DeleteTransactionUseCase,
    GET_TRANSACTION_USE_CASE,
    GetTransactionUseCase,
    QUERY_TRANSACTIONS_USE_CASE,
    QueryTransactionsUseCase,
    TRANSACTIONS_REPOSITORY,
} from './application';
import { TransactionsController } from './adapters/inbound';
import { PgTransactionsRepository } from './adapters/outbound';

@Module({
    imports: [DatabaseModule, AuthModule, AccountsModule, CategoriesModule],
    controllers: [TransactionsController],
    providers: [
        { provide: TRANSACTIONS_REPOSITORY, useClass: PgTransactionsRepository },
        { provide: QUERY_TRANSACTIONS_USE_CASE, useClass: QueryTransactionsUseCase },
        { provide: GET_TRANSACTION_USE_CASE, useClass: GetTransactionUseCase },
        { provide: CREATE_TRANSACTION_USE_CASE, useClass: CreateTransactionUseCase },
        { provide: CREATE_TRANSFER_USE_CASE, useClass: CreateTransferUseCase },
        { provide: DELETE_TRANSACTION_USE_CASE, useClass: DeleteTransactionUseCase },
    ],
    exports: [
        QUERY_TRANSACTIONS_USE_CASE,
        GET_TRANSACTION_USE_CASE,
        CREATE_TRANSACTION_USE_CASE,
        CREATE_TRANSFER_USE_CASE,
        DELETE_TRANSACTION_USE_CASE,
    ],
})
export class TransactionsModule {}
