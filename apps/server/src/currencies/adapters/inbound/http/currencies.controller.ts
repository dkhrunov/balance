import { Controller, Get, Header, Inject, UseGuards } from '@nestjs/common';
import { CurrenciesResponse, CurrenciesVersionResponse } from '@balance/dto/currencies';
import { AuthGuard } from '../../../../auth/adapters/inbound';
import {
    GET_CURRENCIES_USE_CASE,
    GET_CURRENCIES_VERSION_USE_CASE,
    IGetCurrenciesUseCase,
    IGetCurrenciesVersionUseCase,
} from '../../../application';

@Controller('currencies')
export class CurrenciesController {
    public constructor(
        @Inject(GET_CURRENCIES_USE_CASE)
        private readonly getCurrenciesUseCase: IGetCurrenciesUseCase,
        @Inject(GET_CURRENCIES_VERSION_USE_CASE)
        private readonly getCurrenciesVersionUseCase: IGetCurrenciesVersionUseCase,
    ) {}

    /**
     * Content hash of the currencies list. Clients compare this with a cached copy
     * before downloading rows.
     */
    @Get('version')
    @Header('Cache-Control', 'no-store')
    @UseGuards(AuthGuard)
    public getVersion(): Promise<CurrenciesVersionResponse> {
        return this.getCurrenciesVersionUseCase.execute();
    }

    /** Currency rows ordered by ISO code, with the hash of that content. */
    @Get()
    @Header('Cache-Control', 'no-store')
    @UseGuards(AuthGuard)
    public getCurrencies(): Promise<CurrenciesResponse> {
        return this.getCurrenciesUseCase.execute();
    }
}
