import { DeleteAccountRequest } from '@balance/dto/accounts';
import { IsInt, Min } from 'class-validator';

/** HTTP body for `DELETE /accounts/:id`; compatible with {@link DeleteAccountRequest}. */
export class DeleteAccountDto implements DeleteAccountRequest {
    @IsInt()
    @Min(1)
    public version: number;
}
