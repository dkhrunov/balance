import { AccountModel } from '../../models/account.model';

/** Result of an optimistic-concurrency mutation against the accounts store. */
export type AccountMutationResult =
    | { readonly kind: 'ok'; readonly account: AccountModel }
    | { readonly kind: 'not_found' }
    | { readonly kind: 'version_conflict' };

/** Input for inserting a new account row. */
export type CreateAccountRecord = {
    readonly name: string;
    readonly icon: AccountModel['icon'];
    readonly currency: AccountModel['currency'];
    readonly initialBalance: string;
    readonly actorUserId: string;
};

/** Input for updating an active account with optimistic concurrency. */
export type UpdateAccountRecord = {
    readonly id: string;
    readonly name: string;
    readonly icon: AccountModel['icon'];
    readonly expectedVersion: number;
    readonly actorUserId: string;
};

/** Input for soft-deleting an active account with optimistic concurrency. */
export type SoftDeleteAccountRecord = {
    readonly id: string;
    readonly expectedVersion: number;
    readonly actorUserId: string;
};

/**
 * Persistence port for financial accounts in the single app space.
 */
export interface IAccountsRepository {
    /**
     * Lists active (non-deleted) accounts, newest first.
     */
    listActive(): Promise<readonly AccountModel[]>;

    /**
     * Loads an active account by id.
     *
     * @param id Account id.
     * @returns Account or `null` when missing or soft-deleted.
     */
    findActiveById(id: string): Promise<AccountModel | null>;

    /**
     * Inserts a new account; `createdBy` and `updatedBy` are the actor.
     *
     * @param input Create fields and actor.
     */
    create(input: CreateAccountRecord): Promise<AccountModel>;

    /**
     * Updates name and icon on an active account when `expectedVersion` matches.
     *
     * @param input Update fields, expected version, and actor.
     */
    updateActive(input: UpdateAccountRecord): Promise<AccountMutationResult>;

    /**
     * Soft-deletes an active account when `expectedVersion` matches.
     *
     * @param input Delete target, expected version, and actor.
     */
    softDeleteActive(input: SoftDeleteAccountRecord): Promise<AccountMutationResult>;
}

export const ACCOUNTS_REPOSITORY = Symbol('ACCOUNTS_REPOSITORY');
