import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
    Category,
    CATEGORY_ERROR_CODES,
    CATEGORY_ICON_MAX_LENGTH,
    CATEGORY_ICON_MIN_LENGTH,
    CATEGORY_NAME_MAX_LENGTH,
    CATEGORY_NAME_MIN_LENGTH,
    CATEGORY_TYPES,
    CreateCategoryRequest,
    DEFAULT_CATEGORY_ICON,
} from '@balance/contracts/categories';
import { toCategoryResponse } from '../mappers/category-response.mapper';
import { ICreateCategoryUseCase } from '../ports/inbound/create-category.use-case';
import { CATEGORIES_REPOSITORY, ICategoriesRepository } from '../ports/outbound/categories.repository';

@Injectable()
export class CreateCategoryUseCase implements ICreateCategoryUseCase {
    public constructor(
        @Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: ICategoriesRepository,
    ) {}

    public async execute(actorUserId: string, request: CreateCategoryRequest): Promise<Category> {
        if (!(CATEGORY_TYPES as readonly string[]).includes(request.type)) {
            throw new BadRequestException({
                code: CATEGORY_ERROR_CODES.validationFailed,
                message: `Category type must be ${CATEGORY_TYPES.join(' or ')}`,
                details: {},
            });
        }

        const name = request.name.trim();

        if (name.length < CATEGORY_NAME_MIN_LENGTH || name.length > CATEGORY_NAME_MAX_LENGTH) {
            throw new BadRequestException({
                code: CATEGORY_ERROR_CODES.validationFailed,
                message: `Category name must be between ${CATEGORY_NAME_MIN_LENGTH} and ${CATEGORY_NAME_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const icon = (request.icon ?? DEFAULT_CATEGORY_ICON).trim();

        if (icon.length < CATEGORY_ICON_MIN_LENGTH || icon.length > CATEGORY_ICON_MAX_LENGTH) {
            throw new BadRequestException({
                code: CATEGORY_ERROR_CODES.validationFailed,
                message: `Category icon must be between ${CATEGORY_ICON_MIN_LENGTH} and ${CATEGORY_ICON_MAX_LENGTH} characters`,
                details: {},
            });
        }

        const category = await this.categoriesRepository.create({
            type: request.type,
            name,
            icon,
            actorUserId,
        });

        return toCategoryResponse(category);
    }
}
