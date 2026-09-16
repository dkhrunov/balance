import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../../../database/database.service';
import { AuthSession, RefreshSessionResult } from '../../../application/models/auth-session';
import { IAuthSessionsRepository } from '../../../application/ports/outbound/auth-sessions.repository';
import { AuthSessionRecord } from './records/auth-session.record';

@Injectable()
export class PgAuthSessionsRepository implements IAuthSessionsRepository {
    public constructor(private readonly database: DatabaseService) {}

    public async create(
        userId: string,
        refreshTokenHash: string,
        refreshExpiresAt: Date,
        absoluteExpiresAt: Date,
    ): Promise<AuthSession> {
        const sessionId: string = randomUUID();

        const result = await this.database.getPool().query<AuthSessionRecord>(sql`
            INSERT INTO auth_sessions (
                id,
                family_id,
                user_id,
                refresh_token_hash,
                expires_at,
                absolute_expires_at
            )
            VALUES (
                ${sessionId}::uuid, ${sessionId}::uuid, ${userId}::uuid, ${refreshTokenHash}, ${refreshExpiresAt}, ${absoluteExpiresAt}
            )
            RETURNING
                id,
                family_id AS "familyId",
                user_id AS "userId",
                refresh_token_hash AS "refreshTokenHash",
                expires_at AS "expiresAt",
                absolute_expires_at AS "absoluteExpiresAt",
                revoked_at AS "revokedAt",
                replaced_by_session_id AS "replacedBySessionId"
        `);

        return this.toAuthSession(result.rows[0]);
    }

    public async rotate(
        presentedTokenHash: string,
        newTokenHash: string,
        refreshExpiresAt: Date,
    ): Promise<RefreshSessionResult> {
        const client = await this.database.getPool().connect();

        try {
            await client.query(sql`BEGIN`);
            const current = await this.findByRefreshTokenHashForUpdate(client, presentedTokenHash);

            if (!current) {
                await client.query(sql`COMMIT`);

                return { status: 'not-found' };
            }

            if (current.revokedAt) {
                await this.revokeFamily(client, current.familyId);
                await client.query(sql`COMMIT`);

                return { status: 'reused' };
            }

            const now = new Date();
            if (current.expiresAt <= now || current.absoluteExpiresAt <= now) {
                await this.revokeSession(client, current.id);
                await client.query(sql`COMMIT`);

                return { status: 'expired' };
            }

            const newSessionId: string = randomUUID();
            const nextExpiry =
                refreshExpiresAt < current.absoluteExpiresAt ? refreshExpiresAt : current.absoluteExpiresAt;
            const insertResult = await client.query<AuthSessionRecord>(sql`
                INSERT INTO auth_sessions (
                    id,
                    family_id,
                    user_id,
                    refresh_token_hash,
                    expires_at,
                    absolute_expires_at
                )
                VALUES (
                    ${newSessionId}::uuid, ${current.familyId}::uuid, ${current.userId}::uuid, ${newTokenHash}, ${nextExpiry}, ${current.absoluteExpiresAt}
                )
                RETURNING
                    id,
                    family_id AS "familyId",
                    user_id AS "userId",
                    refresh_token_hash AS "refreshTokenHash",
                    expires_at AS "expiresAt",
                    absolute_expires_at AS "absoluteExpiresAt",
                    revoked_at AS "revokedAt",
                    replaced_by_session_id AS "replacedBySessionId"
            `);

            await client.query(sql`
                UPDATE auth_sessions
                SET revoked_at = now(), replaced_by_session_id = ${newSessionId}::uuid
                WHERE id = ${current.id}::uuid
            `);
            await client.query(sql`COMMIT`);

            return { status: 'rotated', session: this.toAuthSession(insertResult.rows[0]) };
        } catch (error) {
            await client.query(sql`ROLLBACK`);
            throw error;
        } finally {
            client.release();
        }
    }

    public async revoke(sessionId: string): Promise<void> {
        await this.database.getPool().query(sql`
            UPDATE auth_sessions
            SET revoked_at = COALESCE(revoked_at, now())
            WHERE id = ${sessionId}::uuid
        `);
    }

    public async isActive(sessionId: string): Promise<boolean> {
        const result = await this.database.getPool().query<{ readonly active: boolean }>(sql`
            SELECT EXISTS (
                SELECT 1
                FROM auth_sessions
                WHERE id = ${sessionId}::uuid
                  AND revoked_at IS NULL
                  AND expires_at > now()
                  AND absolute_expires_at > now()
            ) AS active
        `);

        return result.rows[0]?.active ?? false;
    }

    private toAuthSession(record: AuthSessionRecord): AuthSession {
        return {
            id: record.id,
            userId: record.userId,
        };
    }

    private async findByRefreshTokenHashForUpdate(
        client: PoolClient,
        refreshTokenHash: string,
    ): Promise<AuthSessionRecord | null> {
        const result = await client.query<AuthSessionRecord>(sql`
            SELECT
                id,
                family_id AS "familyId",
                user_id AS "userId",
                refresh_token_hash AS "refreshTokenHash",
                expires_at AS "expiresAt",
                absolute_expires_at AS "absoluteExpiresAt",
                revoked_at AS "revokedAt",
                replaced_by_session_id AS "replacedBySessionId"
            FROM auth_sessions
            WHERE refresh_token_hash = ${refreshTokenHash}
            FOR UPDATE
        `);

        return result.rows[0] ?? null;
    }

    private async revokeFamily(client: PoolClient, familyId: string): Promise<void> {
        await client.query(sql`
            UPDATE auth_sessions
            SET revoked_at = COALESCE(revoked_at, now())
            WHERE family_id = ${familyId}::uuid
        `);
    }

    private async revokeSession(client: PoolClient, sessionId: string): Promise<void> {
        await client.query(sql`
            UPDATE auth_sessions
            SET revoked_at = COALESCE(revoked_at, now())
            WHERE id = ${sessionId}::uuid
        `);
    }
}
