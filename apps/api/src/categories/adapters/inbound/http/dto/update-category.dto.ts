import {
    CATEGORY_NAME_MAX_LENGTH,
    CATEGORY_NAME_MIN_LENGTH,
    UpdateCategoryRequest,
} from '@balance/contracts/categories';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

/** HTTP body for `PUT /categories/:id`; compatible with {@link UpdateCategoryRequest}. */
export class UpdateCategoryDto implements UpdateCategoryRequest {
    @IsString()
    @MinLength(CATEGORY_NAME_MIN_LENGTH)
    @MaxLength(CATEGORY_NAME_MAX_LENGTH)
    public name: string;

    @IsInt()
    @Min(1)
    public version: number;
}
