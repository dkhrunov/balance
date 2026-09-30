import {
    CreateTransactionRequest,
    SIMPLE_TRANSACTION_TYPES,
    TRANSACTION_DESCRIPTION_MAX_LENGTH,
} from '@balance/contracts/transactions';
import { CURRENCY_CODES } from '@balance/contracts/currencies';
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** HTTP body for `POST /transactions`; compatible with {@link CreateTransactionRequest}. */
export class CreateTransactionDto implements CreateTransactionRequest {
    @IsIn([...SIMPLE_TRANSACTION_TYPES])
    public type: CreateTransactionRequest['type'];

    @IsUUID()
    public accountId: string;

    @IsUUID()
    public categoryId: string;

    @IsString()
    public amount: string;

    @IsIn([...CURRENCY_CODES])
    public currency: CreateTransactionRequest['currency'];

    @IsString()
    @Matches(ISO_DATE_PATTERN)
    public transactionDate: string;

    @IsOptional()
    @IsString()
    @MaxLength(TRANSACTION_DESCRIPTION_MAX_LENGTH)
    public description?: string;
}
