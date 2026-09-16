/** Auth configuration needed by application and adapters. */
export interface IAuthConfig {
    readonly secret: string;
    readonly accessTtl: number;
    readonly refreshTtl: number;
    readonly sessionTtl: number;
    readonly webOrigin: string;
    readonly useSecureCookies: boolean;
}

export const AUTH_CONFIG = Symbol('AUTH_CONFIG');
