import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    CreateTransactionRequest,
    DeleteTransactionRequest,
    ListTransactionsRequest,
    ListTransactionsResponse,
    TRANSACTION_ERROR_CODES,
    TRANSACTION_TYPES,
    Transaction,
    TransactionCreatedByFilter,
    TransactionType,
} from '@balance/contracts/transactions';
import { AuthenticatedRequest, AuthGuard } from '../../../../auth/adapters/inbound/http/guards/auth.guard';
import { CsrfOriginGuard } from '../../../../auth/adapters/inbound/http/guards/csrf-origin.guard';
import {
    CREATE_TRANSACTION_USE_CASE,
    DELETE_TRANSACTION_USE_CASE,
    GET_TRANSACTION_USE_CASE,
    ICreateTransactionUseCase,
    IDeleteTransactionUseCase,
    IGetTransactionUseCase,
    IListTransactionsUseCase,
    LIST_TRANSACTIONS_USE_CASE,
} from '../../../application';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';

@Controller('transactions')
export class TransactionsController {
    public constructor(
        @Inject(LIST_TRANSACTIONS_USE_CASE)
        private readonly listTransactionsUseCase: IListTransactionsUseCase,
        @Inject(GET_TRANSACTION_USE_CASE)
        private readonly getTransactionUseCase: IGetTransactionUseCase,
        @Inject(CREATE_TRANSACTION_USE_CASE)
        private readonly createTransactionUseCase: ICreateTransactionUseCase,
        @Inject(DELETE_TRANSACTION_USE_CASE)
        private readonly deleteTransactionUseCase: IDeleteTransactionUseCase,
    ) {}

    @Get()
    @UseGuards(AuthGuard)
    public listTransactions(
        @Req() request: AuthenticatedRequest,
        @Query('createdBy') createdByRaw?: string,
        @Query('accountId') accountId?: string,
        @Query('type') typeRaw?: string,
        @Query('cursor') cursor?: string,
        @Query('limit') limitRaw?: string,
    ): Promise<ListTransactionsResponse> {
        const payload: ListTransactionsRequest = {
            createdBy: this.parseCreatedByFilter(createdByRaw),
            accountId: accountId || undefined,
            type: this.parseOptionalType(typeRaw),
            cursor: cursor || undefined,
            limit: this.parseOptionalLimit(limitRaw),
        };

        return this.listTransactionsUseCase.execute(request.auth.user.id, payload);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    public getTransaction(@Param('id') transactionId: string): Promise<Transaction> {
        return this.getTransactionUseCase.execute(transactionId);
    }

    @Post()
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public createTransaction(
        @Req() request: AuthenticatedRequest,
        @Body() body: CreateTransactionDto,
    ): Promise<Transaction> {
        const payload: CreateTransactionRequest = {
            type: body.type,
            accountId: body.accountId,
            categoryId: body.categoryId,
            amount: body.amount,
            currency: body.currency,
            transactionDate: body.transactionDate,
            description: body.description,
        };

        return this.createTransactionUseCase.execute(request.auth.user.id, payload);
    }

    @Delete(':id')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public deleteTransaction(
        @Req() request: AuthenticatedRequest,
        @Param('id') transactionId: string,
        @Body() body: DeleteTransactionDto,
    ): Promise<Transaction> {
        const payload: DeleteTransactionRequest = {
            version: body.version,
        };

        return this.deleteTransactionUseCase.execute(request.auth.user.id, transactionId, payload);
    }

    private parseCreatedByFilter(createdByRaw: string | undefined): TransactionCreatedByFilter | undefined {
        if (createdByRaw === undefined || createdByRaw === '' || createdByRaw === 'all') {
            return { mode: 'all' };
        }

        if (createdByRaw === 'me') {
            return { mode: 'me' };
        }

        const userIds = createdByRaw
            .split(',')
            .map((value) => value.trim())
            .filter((value) => value.length > 0);

        if (userIds.length === 0) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: 'createdBy must be all, me, or a comma-separated list of user ids',
                details: {},
            });
        }

        return { mode: 'users', userIds };
    }

    private parseOptionalType(type: string | undefined): TransactionType | undefined {
        if (type === undefined || type === '') {
            return undefined;
        }

        if ((TRANSACTION_TYPES as readonly string[]).includes(type)) {
            return type as TransactionType;
        }

        throw new BadRequestException({
            code: TRANSACTION_ERROR_CODES.validationFailed,
            message: `Transaction type must be ${TRANSACTION_TYPES.join(' or ')}`,
            details: {},
        });
    }

    private parseOptionalLimit(limitRaw: string | undefined): number | undefined {
        if (limitRaw === undefined || limitRaw === '') {
            return undefined;
        }

        const limit = Number(limitRaw);

        if (!Number.isInteger(limit)) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: 'limit must be an integer',
                details: {},
            });
        }

        return limit;
    }
}
