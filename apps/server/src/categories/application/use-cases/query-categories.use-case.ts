import { Inject, Injectable } from '@nestjs/common';
import { CategoryType, QueryCategoriesResponse } from '@balance/dto/categories';
import { toCategoryResponse } from '../mappers/category-response.mapper';
import { IQueryCategoriesUseCase } from '../ports/inbound/query-categories.use-case';
import { CATEGORIES_REPOSITORY, ICategoriesRepository } from '../ports/outbound/categories.repository';

@Injectable()
export class QueryCategoriesUseCase implements IQueryCategoriesUseCase {
    public constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: ICategoriesRepository) {}

    public async execute(type?: CategoryType): Promise<QueryCategoriesResponse> {
        const categories = await this.categoriesRepository.findActive(type);

        return { items: categories.map(toCategoryResponse) };
    }
}
