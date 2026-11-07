import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import {
    CURRENCIES_REPOSITORY,
    GET_CURRENCIES_USE_CASE,
    GET_CURRENCIES_VERSION_USE_CASE,
    GetCurrenciesUseCase,
    GetCurrenciesVersionUseCase,
} from './application';
import { CurrenciesController } from './adapters/inbound';
import { PgCurrenciesRepository } from './adapters/outbound';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [CurrenciesController],
    providers: [
        { provide: CURRENCIES_REPOSITORY, useClass: PgCurrenciesRepository },
        { provide: GET_CURRENCIES_USE_CASE, useClass: GetCurrenciesUseCase },
        { provide: GET_CURRENCIES_VERSION_USE_CASE, useClass: GetCurrenciesVersionUseCase },
    ],
})
export class CurrenciesModule {}
