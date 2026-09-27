import { BadRequestException } from '@nestjs/common';
import { TRANSACTION_ERROR_CODES } from '@balance/contracts/transactions';
import { TransactionListCursor } from './ports/outbound/transactions.repository';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Encodes a keyset cursor for transaction list pagination.
 *
 * @param cursor Sort key of the last item on the current page.
 */
export function encodeTransactionCursor(cursor: TransactionListCursor): string {
    const payload = `${cursor.transactionDate}|${cursor.createdAt.toISOString()}|${cursor.id}`;

    return Buffer.from(payload, 'utf8').toString('base64url');
}

/**
 * Decodes a keyset cursor from the list query string.
 *
 * @param value Opaque cursor from the client.
 * @throws {BadRequestException} When the cursor is malformed.
 */
export function decodeTransactionCursor(value: string): TransactionListCursor {
    let decoded: string;

    try {
        decoded = Buffer.from(value, 'base64url').toString('utf8');
    } catch {
        throw invalidCursor();
    }

    const parts = decoded.split('|');

    if (parts.length !== 3) {
        throw invalidCursor();
    }

    const [transactionDate, createdAtRaw, id] = parts;

    if (!ISO_DATE_PATTERN.test(transactionDate) || id.length === 0) {
        throw invalidCursor();
    }

    const createdAt = new Date(createdAtRaw);

    if (Number.isNaN(createdAt.getTime())) {
        throw invalidCursor();
    }

    return { transactionDate, createdAt, id };
}

/**
 * Returns whether a string is a calendar date in `YYYY-MM-DD` form with a real calendar day.
 *
 * @param value Candidate date string.
 */
export function isIsoDate(value: string): boolean {
    if (!ISO_DATE_PATTERN.test(value)) {
        return false;
    }

    const [yearText, monthText, dayText] = value.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function invalidCursor(): BadRequestException {
    return new BadRequestException({
        code: TRANSACTION_ERROR_CODES.validationFailed,
        message: 'Invalid pagination cursor',
        details: {},
    });
}
