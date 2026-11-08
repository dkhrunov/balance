import {
    CurrenciesResponse,
    CurrenciesVersionResponse,
} from '@balance/dto/currencies';
import { ApiClient } from '../api-client';

let versionRequest: Promise<CurrenciesVersionResponse> | null = null;
let currenciesRequest: Promise<CurrenciesResponse> | null = null;

export class CurrenciesApi {
    private constructor() {
        /* empty constructor */
    }

    /**
     * Content hash of the currencies list.
     * Overlapping calls share one in-flight request.
     */
    public static getVersion(): Promise<CurrenciesVersionResponse> {
        if (!versionRequest) {
            versionRequest = ApiClient.get<CurrenciesVersionResponse>('/currencies/version').finally(() => {
                versionRequest = null;
            });
        }

        return versionRequest;
    }

    /**
     * Full currencies list.
     * Overlapping calls share one in-flight request.
     */
    public static getCurrencies(): Promise<CurrenciesResponse> {
        if (!currenciesRequest) {
            currenciesRequest = ApiClient.get<CurrenciesResponse>('/currencies').finally(() => {
                currenciesRequest = null;
            });
        }

        return currenciesRequest;
    }
}
