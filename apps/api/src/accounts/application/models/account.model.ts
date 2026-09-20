import { CurrencyCode } from '@balance/contracts/currencies';

/** Application-layer account aggregate used by use cases and the repository. */
export type AccountModel = {
    readonly id: string;
    readonly name: string;
    readonly currency: CurrencyCode;
    readonly initialBalance: string;
    readonly version: number;
    readonly createdBy: string;
    readonly updatedBy: string;
    readonly deletedBy: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};
