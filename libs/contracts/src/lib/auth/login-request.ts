/** Credentials accepted by the login endpoint. */
export interface LoginRequest {
    readonly email: string;
    readonly password: string;
}
