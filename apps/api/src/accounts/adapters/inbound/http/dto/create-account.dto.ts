import { CreateAccountRequest } from '@balance/contracts/accounts';
import { CURRENCY_CODES } from '@balance/contracts/currencies';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

/** HTTP body for `POST /accounts`; compatible with {@link CreateAccountRequest}. */
export class CreateAccountDto implements CreateAccountRequest {
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    public name: string;

    @IsIn([...CURRENCY_CODES])
    public currency: CreateAccountRequest['currency'];

    @IsString()
    @MinLength(1)
    public initialBalance: string;
}
