import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';

/** Cryptographic helpers for opaque refresh tokens. */
@Injectable()
export class RefreshTokenService {
    /** Creates a cryptographically random opaque refresh token. */
    public create(): string {
        return randomBytes(48).toString('base64url');
    }

    /** Hashes a token for storage and lookup without keeping the raw value. */
    public createHash(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
