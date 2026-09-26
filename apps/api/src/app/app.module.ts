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

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [join(process.cwd(), 'apps/api/.env')],
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        AccountsModule,
        CategoriesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
