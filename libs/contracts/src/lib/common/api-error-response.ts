/** Structured error envelope returned by the API. */
export interface ApiErrorResponse {
    readonly code: string;
    readonly message: string;
    readonly details: Readonly<Record<string, unknown>>;
}
