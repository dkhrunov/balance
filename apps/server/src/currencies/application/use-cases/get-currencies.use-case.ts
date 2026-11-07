import { Inject, Injectable } from '@nestjs/common';
import { CurrenciesResponse } from '@balance/dto/currencies';
import { currenciesVersion } from '../currencies-version';
import { IGetCurrenciesUseCase } from '../ports/inbound/get-currencies.use-case';
import { CURRENCIES_REPOSITORY, ICurrenciesRepository } from '../ports/outbound/currencies.repository';

@Injectable()
export class GetCurrenciesUseCase implements IGetCurrenciesUseCase {
    public constructor(@Inject(CURRENCIES_REPOSITORY) private readonly currenciesRepository: ICurrenciesRepository) {}

    public async execute(): Promise<CurrenciesResponse> {
        const items = await this.currenciesRepository.findAll();

        return {
            version: currenciesVersion(items),
            items,
        };
    }
}
