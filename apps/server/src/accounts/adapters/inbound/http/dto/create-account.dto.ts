import {
    ACCOUNT_ICON_MAX_LENGTH,
    ACCOUNT_ICON_MIN_LENGTH,
    ACCOUNT_NAME_MAX_LENGTH,
    ACCOUNT_NAME_MIN_LENGTH,
    CreateAccountRequest,
} from '@balance/dto/accounts';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

/** HTTP body for `POST /accounts`; compatible with {@link CreateAccountRequest}. */
export class CreateAccountDto implements CreateAccountRequest {
    @IsString()
    @MinLength(ACCOUNT_NAME_MIN_LENGTH)
    @MaxLength(ACCOUNT_NAME_MAX_LENGTH)
    public name: string;

    @IsString()
    @Matches(CURRENCY_CODE_PATTERN)
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
