import { Inject, Injectable } from '@nestjs/common';
import { CurrenciesVersionResponse } from '@balance/dto/currencies';
import { currenciesVersion } from '../currencies-version';
import { IGetCurrenciesVersionUseCase } from '../ports/inbound/get-currencies-version.use-case';
import { CURRENCIES_REPOSITORY, ICurrenciesRepository } from '../ports/outbound/currencies.repository';

@Injectable()
export class GetCurrenciesVersionUseCase implements IGetCurrenciesVersionUseCase {
    public constructor(@Inject(CURRENCIES_REPOSITORY) private readonly currenciesRepository: ICurrenciesRepository) {}

    public async execute(): Promise<CurrenciesVersionResponse> {
        const items = await this.currenciesRepository.findAll();

        return { version: currenciesVersion(items) };
    }
}
