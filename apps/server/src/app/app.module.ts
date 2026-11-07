import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth';
import { UsersModule } from '../users';
import { AccountsModule } from '../accounts';
import { CategoriesModule } from '../categories';
import { TransactionsModule } from '../transactions';
import { CurrenciesModule } from '../currencies';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [join(process.cwd(), 'apps/server/.env')],
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        AccountsModule,
        CategoriesModule,
        TransactionsModule,
        CurrenciesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
