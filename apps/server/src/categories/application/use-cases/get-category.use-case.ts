import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Category, CATEGORY_ERROR_CODES } from '@balance/contracts/categories';
import { toCategoryResponse } from '../mappers/category-response.mapper';
import { IGetCategoryUseCase } from '../ports/inbound/get-category.use-case';
import { CATEGORIES_REPOSITORY, ICategoriesRepository } from '../ports/outbound/categories.repository';

@Injectable()
export class GetCategoryUseCase implements IGetCategoryUseCase {
    public constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: ICategoriesRepository) {}

    public async execute(categoryId: string): Promise<Category> {
        const category = await this.categoriesRepository.findActiveById(categoryId);

        if (!category) {
            throw new NotFoundException({
                code: CATEGORY_ERROR_CODES.notFound,
                message: 'Category not found',
                details: {},
            });
        }

        return toCategoryResponse(category);
    }
}
