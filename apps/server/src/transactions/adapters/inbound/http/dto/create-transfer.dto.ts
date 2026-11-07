import { CreateTransferRequest, TRANSACTION_DESCRIPTION_MAX_LENGTH } from '@balance/dto/transactions';
import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

/** HTTP body for `POST /transactions/transfers`; compatible with {@link CreateTransferRequest}. */
export class CreateTransferDto implements CreateTransferRequest {
    @IsUUID()
    public fromAccountId: string;

    @IsUUID()
    public toAccountId: string;

    @IsString()
    public amount: string;

    @IsString()
    @Matches(CURRENCY_CODE_PATTERN)
    public currency: CreateTransferRequest['currency'];

    @IsString()
    @Matches(ISO_DATE_PATTERN)
    public transactionDate: string;

    @IsOptional()
    @IsString()
    @MaxLength(TRANSACTION_DESCRIPTION_MAX_LENGTH)
    public description?: string;
}
