/** Opaque wire identifier for an entity. */
export type EntityId = string & { readonly __entityId?: never };

/** ISO 8601 timestamp carried across the API boundary. */
export type IsoTimestamp = string & { readonly __isoTimestamp?: never };

/** Optimistic-concurrency version carried by mutable entities. */
export type EntityVersion = number & { readonly __entityVersion?: never };

/** Client-generated idempotency key for a mutation. */
export type OperationId = string & { readonly __operationId?: never };

/** Cursor pagination parameters shared by list endpoints. */
export interface CursorPageRequest {
    readonly cursor?: string;
    readonly limit?: number;
}

/** Cursor pagination envelope shared by list responses. */
export interface CursorPageResponse<Item> {
    readonly items: readonly Item[];
    readonly nextCursor: string | null;
}

/** Structured error envelope returned by the API. */
export interface ApiErrorResponse {
    readonly code: string;
    readonly message: string;
}
