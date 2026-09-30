import {
    ACCOUNT_ICON_MAX_LENGTH,
    ACCOUNT_ICON_MIN_LENGTH,
    ACCOUNT_NAME_MAX_LENGTH,
    ACCOUNT_NAME_MIN_LENGTH,
    UpdateAccountRequest,
} from '@balance/dto/accounts';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

/** HTTP body for `PUT /accounts/:id`; compatible with {@link UpdateAccountRequest}. */
export class UpdateAccountDto implements UpdateAccountRequest {
    @IsString()
    @MinLength(ACCOUNT_NAME_MIN_LENGTH)
    @MaxLength(ACCOUNT_NAME_MAX_LENGTH)
    public name: string;

    @IsString()
    @MinLength(ACCOUNT_ICON_MIN_LENGTH)
    @MaxLength(ACCOUNT_ICON_MAX_LENGTH)
    public icon: string;

    @IsInt()
    @Min(1)
    public version: number;
}
