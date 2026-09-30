import { CreateTransferRequest, CreateTransferResponse } from '@balance/contracts/transactions';

/** Creates an atomic same-currency transfer between two accounts. */
export interface ICreateTransferUseCase {
    /**
     * @param actorUserId Authenticated user performing the transfer (attribution).
     * @param request Transfer payload.
     */
    execute(actorUserId: string, request: CreateTransferRequest): Promise<CreateTransferResponse>;
}

export const CREATE_TRANSFER_USE_CASE = Symbol('CREATE_TRANSFER_USE_CASE');
