import {
    CATEGORY_ICON_MAX_LENGTH,
    CATEGORY_ICON_MIN_LENGTH,
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

    @IsString()
    @MinLength(CATEGORY_ICON_MIN_LENGTH)
    @MaxLength(CATEGORY_ICON_MAX_LENGTH)
    public icon: string;

    @IsInt()
    @Min(1)
    public version: number;
}
