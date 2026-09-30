import { Inject, Injectable } from '@nestjs/common';
import { CategoryType, ListCategoriesResponse } from '@balance/contracts/categories';
import { toCategoryResponse } from '../mappers/category-response.mapper';
import { IListCategoriesUseCase } from '../ports/inbound/list-categories.use-case';
import { CATEGORIES_REPOSITORY, ICategoriesRepository } from '../ports/outbound/categories.repository';

@Injectable()
export class ListCategoriesUseCase implements IListCategoriesUseCase {
    public constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categoriesRepository: ICategoriesRepository) {}

    public async execute(type?: CategoryType): Promise<ListCategoriesResponse> {
        const categories = await this.categoriesRepository.listActive(type);

        return { items: categories.map(toCategoryResponse) };
    }
}
