/** Error thrown when an API request fails with a non-success HTTP status. */
export class ApiError extends Error {
    public readonly code: string;
    public readonly status: number;

    public constructor(status: number, code: string, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}
