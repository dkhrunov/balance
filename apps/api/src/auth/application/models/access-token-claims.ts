/** Claims carried by a verified access token. */
export type AccessTokenClaims = {
    readonly sub: string;
    readonly sid: string;
};
