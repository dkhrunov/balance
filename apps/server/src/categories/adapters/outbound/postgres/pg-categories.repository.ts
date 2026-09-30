import { sql } from '@ts-safeql/sql-tag';
import { Injectable } from '@nestjs/common';
import { CategoryType } from '@balance/dto/categories';
import { DatabaseService } from '../../../../database/database.service';
import { CategoryModel } from '../../../application/models/category.model';
import {
    CategoryMutationResult,
    CreateCategoryRecord,
    ICategoriesRepository,
    SoftDeleteCategoryRecord,
    UpdateCategoryRecord,
} from '../../../application/ports/outbound/categories.repository';
import { CategoryRecord } from './records/category.record';

@Injectable()
export class PgCategoriesRepository implements ICategoriesRepository {
    public constructor(private readonly database: DatabaseService) {}

    public async listActive(type?: CategoryType): Promise<readonly CategoryModel[]> {
        if (type) {
            const result = await this.database.getPool().query<CategoryRecord>(sql`
                SELECT
                    id,
                    type,
                    name,
                    icon,
                    version,
                    created_by AS "createdBy",
                    updated_by AS "updatedBy",
                    deleted_by AS "deletedBy",
                    created_at AS "createdAt",
                    updated_at AS "updatedAt",
                    deleted_at AS "deletedAt"
                FROM categories
                WHERE deleted_at IS NULL
                  AND type = ${type}
                ORDER BY created_at DESC
            `);

            return result.rows.map((row) => this.toCategoryModel(row));
        }

        const result = await this.database.getPool().query<CategoryRecord>(sql`
            SELECT
                id,
                type,
                name,
                icon,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM categories
            WHERE deleted_at IS NULL
            ORDER BY type ASC, created_at DESC
        `);

        return result.rows.map((row) => this.toCategoryModel(row));
    }

    public async findActiveById(id: string): Promise<CategoryModel | null> {
        const result = await this.database.getPool().query<CategoryRecord>(sql`
            SELECT
                id,
                type,
                name,
                icon,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
            FROM categories
            WHERE id = ${id}::uuid
              AND deleted_at IS NULL
        `);

        return result.rows[0] ? this.toCategoryModel(result.rows[0]) : null;
    }

    public async create(input: CreateCategoryRecord): Promise<CategoryModel> {
        const result = await this.database.getPool().query<CategoryRecord>(sql`
            INSERT INTO categories (
                type,
                name,
                icon,
                created_by,
                updated_by
            )
            VALUES (
                ${input.type},
                ${input.name},
                ${input.icon},
                ${input.actorUserId}::uuid,
                ${input.actorUserId}::uuid
            )
            RETURNING
                id,
                type,
                name,
                icon,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        return this.toCategoryModel(result.rows[0]);
    }

    public async updateActive(input: UpdateCategoryRecord): Promise<CategoryMutationResult> {
        const result = await this.database.getPool().query<CategoryRecord>(sql`
            UPDATE categories
            SET
                name = ${input.name},
                icon = ${input.icon},
                version = version + 1,
                updated_by = ${input.actorUserId}::uuid,
                updated_at = now()
            WHERE id = ${input.id}::uuid
              AND version = ${input.expectedVersion}
              AND deleted_at IS NULL
            RETURNING
                id,
                type,
                name,
                icon,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        if (result.rows[0]) {
            return { kind: 'ok', category: this.toCategoryModel(result.rows[0]) };
        }

        return this.resolveMutationMiss(input.id);
    }

    public async softDeleteActive(input: SoftDeleteCategoryRecord): Promise<CategoryMutationResult> {
        const result = await this.database.getPool().query<CategoryRecord>(sql`
            UPDATE categories
            SET
                version = version + 1,
                updated_by = ${input.actorUserId}::uuid,
                updated_at = now(),
                deleted_by = ${input.actorUserId}::uuid,
                deleted_at = now()
            WHERE id = ${input.id}::uuid
              AND version = ${input.expectedVersion}
              AND deleted_at IS NULL
            RETURNING
                id,
                type,
                name,
                icon,
                version,
                created_by AS "createdBy",
                updated_by AS "updatedBy",
                deleted_by AS "deletedBy",
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
        `);

        if (result.rows[0]) {
            return { kind: 'ok', category: this.toCategoryModel(result.rows[0]) };
        }

        return this.resolveMutationMiss(input.id);
    }

    private async resolveMutationMiss(id: string): Promise<CategoryMutationResult> {
        const result = await this.database.getPool().query<{ exists: boolean }>(sql`
            SELECT EXISTS(
                SELECT 1
                FROM categories
                WHERE id = ${id}::uuid
                  AND deleted_at IS NULL
            ) AS exists
        `);

        if (result.rows[0]?.exists) {
            return { kind: 'version_conflict' };
        }

        return { kind: 'not_found' };
    }

    private toCategoryModel(record: CategoryRecord): CategoryModel {
        return {
            id: record.id,
            type: record.type,
            name: record.name,
            icon: record.icon,
            version: record.version,
            createdBy: record.createdBy,
            updatedBy: record.updatedBy,
            deletedBy: record.deletedBy,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            deletedAt: record.deletedAt,
        };
    }
}
