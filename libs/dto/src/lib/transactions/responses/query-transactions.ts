import { CursorPageResponse } from '../../common';
import { Transaction } from '../models/transaction';

/** Cursor page of active income/expense/transfer transactions. */
export type QueryTransactionsResponse = CursorPageResponse<Transaction>;
