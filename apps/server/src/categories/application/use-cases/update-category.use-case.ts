import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    Category,
    CATEGORY_ERROR_CODES,
    CATEGORY_ICON_MAX_LENGTH,
    CATEGORY_ICON_MIN_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
    CATEGORY_NAME_MIN_LENGTH,
    UpdateCategoryRequest,
} from '@balance/dto/categories';
import { toCategoryResponse } from '../mappers/category-response.mapper';
import { IUpdateCategoryUseCase } from '../ports/inbound/update-category.use-case';
import { CATEGORIES_REPOSITORY, ICategoriesRepository } from '../ports/outbound/categories.repository';

@Injectable()
export class UpdateCategoryUseCase implements IUpdateCategoryUseCase {
    public constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: ICategoriesRepository) {}

    public async execute(actorUserId: string, categoryId: string, request: UpdateCategoryRequest): Promise<Category> {
        const name = request.name.trim();

        if (name.length < CATEGORY_NAME_MIN_LENGTH || name.length > CATEGORY_NAME_MAX_LENGTH) {
            throw new BadRequestException({
                code: CATEGORY_ERROR_CODES.validationFailed,
                message: `Category name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const icon = request.icon.trim();

        if (icon.length < CATEGORY_ICON_MIN_LENGTH || icon.length > CATEGORY_ICON_MAX_LENGTH) {
            throw new BadRequestException({
                code: CATEGORY_ERROR_CODES.validationFailed,
                message: `Category icon must be between ${CATEGORY_ICON_MIN_LENGTH} and ${CATEGORY_ICON_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const result = await this.categoriesRepository.updateActive({
            id: categoryId,
            name,
            icon,
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
