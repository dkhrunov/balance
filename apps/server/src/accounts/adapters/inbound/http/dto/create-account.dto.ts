import {
    ACCOUNT_ICON_MAX_LENGTH,
    ACCOUNT_ICON_MIN_LENGTH,
    ACCOUNT_NAME_MAX_LENGTH,
    ACCOUNT_NAME_MIN_LENGTH,
    CreateAccountRequest,
} from '@balance/dto/accounts';
import { CURRENCY_CODES } from '@balance/dto/currencies';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** HTTP body for `POST /accounts`; compatible with {@link CreateAccountRequest}. */
export class CreateAccountDto implements CreateAccountRequest {
    @IsString()
    @MinLength(ACCOUNT_NAME_MIN_LENGTH)
    @MaxLength(ACCOUNT_NAME_MAX_LENGTH)
    public name: string;

    @IsIn([...CURRENCY_CODES])
    public currency: CreateAccountRequest['currency'];

    @IsString()
    @MinLength(1)
    public initialBalance: string;

    @IsOptional()
    @IsString()
    @MinLength(ACCOUNT_ICON_MIN_LENGTH)
    @MaxLength(ACCOUNT_ICON_MAX_LENGTH)
    public icon?: string;
}
