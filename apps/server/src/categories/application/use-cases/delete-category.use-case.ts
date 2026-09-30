import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Category, CATEGORY_ERROR_CODES, DeleteCategoryRequest } from '@balance/contracts/categories';
import { toCategoryResponse } from '../mappers/category-response.mapper';
import { IDeleteCategoryUseCase } from '../ports/inbound/delete-category.use-case';
import { CATEGORIES_REPOSITORY, ICategoriesRepository } from '../ports/outbound/categories.repository';

@Injectable()
export class DeleteCategoryUseCase implements IDeleteCategoryUseCase {
    public constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: ICategoriesRepository) {}

    public async execute(actorUserId: string, categoryId: string, request: DeleteCategoryRequest): Promise<Category> {
        const result = await this.categoriesRepository.softDeleteActive({
            id: categoryId,
            expectedVersion: request.version,
            actorUserId,
        });

        if (result.kind === 'not_found') {
            throw new NotFoundException({
                code: CATEGORY_ERROR_CODES.notFound,
                message: 'Category not found',
                details: {},
            });
        }

        if (result.kind === 'version_conflict') {
            throw new ConflictException({
                code: CATEGORY_ERROR_CODES.versionConflict,
                message: 'Category was modified by another request',
                details: {},
            });
        }

        return toCategoryResponse(result.category);
    }
}
