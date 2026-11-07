import { createHash } from 'node:crypto';
import { CurrencyItem } from '@balance/dto/currencies';

/**
 * SHA-256 of currency rows in `key` order.
 * Each row is `key|symbol`; rows are separated by a newline.
 *
 * @param items Currency rows already sorted by `key`.
 */
export function currenciesVersion(items: readonly CurrencyItem[]): string {
    const canonical = items.map((item) => `${item.key}|${item.symbol}`).join('\n');

    return createHash('sha256').update(canonical, 'utf8').digest('hex');
}
