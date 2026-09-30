import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
    ListTransactionsRequest,
    ListTransactionsResponse,
    TRANSACTION_ERROR_CODES,
    TRANSACTION_TYPES,
} from '@balance/dto/transactions';
import { toTransactionResponse } from '../mappers/transaction-response.mapper';
import { IListTransactionsUseCase } from '../ports/inbound/list-transactions.use-case';
import { ITransactionsRepository, TRANSACTIONS_REPOSITORY } from '../ports/outbound/transactions.repository';
import { decodeTransactionCursor, encodeTransactionCursor } from '../transaction-cursor';

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ListTransactionsUseCase implements IListTransactionsUseCase {
    public constructor(
        @Inject(TRANSACTIONS_REPOSITORY) private readonly transactionsRepository: ITransactionsRepository,
    ) {}

    public async execute(actorUserId: string, request: ListTransactionsRequest): Promise<ListTransactionsResponse> {
        const createdByUserIds = this.resolveCreatedByFilter(actorUserId, request);
        const limit = this.resolveLimit(request.limit);
        const cursor = request.cursor ? decodeTransactionCursor(request.cursor) : null;

        if (request.type !== undefined && !(TRANSACTION_TYPES as readonly string[]).includes(request.type)) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: `Transaction type must be ${TRANSACTION_TYPES.join(' or ')}`,
                details: {},
            });
        }

        if (request.accountId !== undefined && !UUID_PATTERN.test(request.accountId)) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: 'accountId must be a UUID',
                details: {},
            });
        }

        const rows = await this.transactionsRepository.listActive({
            createdByUserIds,
            accountId: request.accountId ?? null,
            type: request.type ?? null,
            cursor,
            limit: limit + 1,
        });

        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;
        const last = page[page.length - 1];
        const nextCursor =
            hasMore && last
                ? encodeTransactionCursor({
                      transactionDate: last.transactionDate,
                      createdAt: last.createdAt,
                      id: last.id,
                  })
                : null;

        return {
            items: page.map(toTransactionResponse),
            nextCursor,
        };
    }

    private resolveCreatedByFilter(actorUserId: string, request: ListTransactionsRequest): readonly string[] | null {
        const filter = request.createdBy;

        if (!filter || filter.mode === 'all') {
            return null;
        }

        if (filter.mode === 'me') {
            return [actorUserId];
        }

        if (filter.userIds.length === 0) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: 'createdBy.users requires at least one user id',
                details: {},
            });
        }

        for (const userId of filter.userIds) {
            if (!UUID_PATTERN.test(userId)) {
                throw new BadRequestException({
                    code: TRANSACTION_ERROR_CODES.validationFailed,
                    message: 'createdBy user ids must be UUIDs',
                    details: {},
                });
            }
        }

        return filter.userIds;
    }

    private resolveLimit(limit: number | undefined): number {
        if (limit === undefined) {
            return DEFAULT_PAGE_LIMIT;
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
            throw new BadRequestException({
                code: TRANSACTION_ERROR_CODES.validationFailed,
                message: `limit must be an integer between 1 and ${MAX_PAGE_LIMIT}`,
                details: {},
            });
        }

        return limit;
    }
}
