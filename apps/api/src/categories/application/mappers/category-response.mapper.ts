import { Category } from '@balance/contracts/categories';
import { CategoryModel } from '../models/category.model';

/**
 * Maps an application category model to the public wire contract.
 *
 * @param category Application-layer category.
 * @returns Contract `Category` response.
 */
export function toCategoryResponse(category: CategoryModel): Category {
    return {
        id: category.id,
        type: category.type,
        name: category.name,
        version: category.version,
        createdBy: category.createdBy,
        updatedBy: category.updatedBy,
        deletedBy: category.deletedBy,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
        deletedAt: category.deletedAt ? category.deletedAt.toISOString() : null,
    };
}
