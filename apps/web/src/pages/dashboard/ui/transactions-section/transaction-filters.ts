import { TransactionType } from '@balance/dto/transactions';

/** Toolbar filter: any ledger type or unrestricted. */
export type TypeFilter = 'all' | TransactionType;

/** Dropdown item for type toolbar filter. */
export type FilterItem<T extends string | number> = {
    readonly id: T;
    readonly label: string;
};
