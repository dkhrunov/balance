import { DeleteTransactionRequest } from '@balance/dto/transactions';
import { IsInt, Min } from 'class-validator';

/** HTTP body for `DELETE /transactions/:id`; compatible with {@link DeleteTransactionRequest}. */
export class DeleteTransactionDto implements DeleteTransactionRequest {
    @IsInt()
    @Min(1)
    public version: number;
}
