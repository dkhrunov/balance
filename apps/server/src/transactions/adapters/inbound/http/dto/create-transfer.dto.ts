import { CreateTransferRequest, TRANSACTION_DESCRIPTION_MAX_LENGTH } from '@balance/dto/transactions';
import { CURRENCY_CODES } from '@balance/dto/currencies';
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** HTTP body for `POST /transactions/transfers`; compatible with {@link CreateTransferRequest}. */
export class CreateTransferDto implements CreateTransferRequest {
    @IsUUID()
    public fromAccountId: string;

    @IsUUID()
    public toAccountId: string;

    @IsString()
    public amount: string;

    @IsIn([...CURRENCY_CODES])
    public currency: CreateTransferRequest['currency'];

    @IsString()
    @Matches(ISO_DATE_PATTERN)
    public transactionDate: string;

    @IsOptional()
    @IsString()
    @MaxLength(TRANSACTION_DESCRIPTION_MAX_LENGTH)
    public description?: string;
}
