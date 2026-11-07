import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { CurrencyItem } from '@balance/dto/currencies';
import { DatabaseService } from '../../../../database/database.service';
import { ICurrenciesRepository } from '../../../application/ports/outbound/currencies.repository';

@Injectable()
export class PgCurrenciesRepository implements ICurrenciesRepository {
    public constructor(private readonly database: DatabaseService) {}

    public async findAll(): Promise<readonly CurrencyItem[]> {
        const result = await this.database.getPool().query<CurrencyItem>(sql`
            SELECT key, symbol
            FROM currencies
            ORDER BY key
        `);

        return result.rows;
    }
}
