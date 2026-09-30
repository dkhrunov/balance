import { AccessTokenClaims } from '../../models/access-token-claims';

/** Outbound port for signing and verifying JWT access tokens. */
export interface IAccessTokenService {
    sign(userId: string, sessionId: string): Promise<string>;
    verify(accessToken: string): Promise<AccessTokenClaims>;
}

export const ACCESS_TOKEN_SERVICE = Symbol('ACCESS_TOKEN_SERVICE');
