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
