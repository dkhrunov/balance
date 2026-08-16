import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from '@ts-safeql/sql-tag';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private readonly pool: Pool;

    public constructor(private readonly config: ConfigService) {
        this.pool = new Pool({
            host: this.config.getOrThrow<string>('DATABASE_HOST'),
            port: Number(this.config.getOrThrow<string>('DATABASE_PORT')),
            user: this.config.getOrThrow<string>('DATABASE_USER'),
            password: this.config.getOrThrow<string>('DATABASE_PASSWORD'),
            database: this.config.getOrThrow<string>('DATABASE_NAME'),
        });
    }

    public async onModuleInit(): Promise<void> {
        await this.pool.query(sql`SELECT 1`);
        this.logger.log('PostgreSQL connection OK');
    }

    public async onModuleDestroy(): Promise<void> {
        await this.pool.end();
    }

    public getPool(): Pool {
        return this.pool;
    }
}
