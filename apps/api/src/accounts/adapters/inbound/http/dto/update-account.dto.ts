import { ACCOUNT_ICON_MAX_LENGTH, UpdateAccountRequest } from '@balance/contracts/accounts';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

/** HTTP body for `PUT /accounts/:id`; compatible with {@link UpdateAccountRequest}. */
export class UpdateAccountDto implements UpdateAccountRequest {
    @IsString()
    @MinLength(1)
    @MaxLength(120)
    public name: string;

    @IsString()
    @MinLength(1)
    @MaxLength(ACCOUNT_ICON_MAX_LENGTH)
    public icon: string;

    @IsInt()
    @Min(1)
    public version: number;
}
