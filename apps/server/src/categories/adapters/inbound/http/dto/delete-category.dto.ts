import { DeleteCategoryRequest } from '@balance/dto/categories';
import { IsInt, Min } from 'class-validator';

/** HTTP body for `DELETE /categories/:id`; compatible with {@link DeleteCategoryRequest}. */
export class DeleteCategoryDto implements DeleteCategoryRequest {
    @IsInt()
    @Min(1)
    public version: number;
}
