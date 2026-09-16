import { UserAccount } from '../../models/user-account';

/** Port for loading persisted users. */
export interface IUsersRepository {
    findByEmail(email: string): Promise<UserAccount | null>;
    findById(id: string): Promise<UserAccount | null>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
