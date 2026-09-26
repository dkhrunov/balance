import {
    CATEGORY_NAME_MAX_LENGTH,
    CATEGORY_NAME_MIN_LENGTH,
    CATEGORY_TYPES,
    CreateCategoryRequest,
} from '@balance/contracts/categories';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

/** HTTP body for `POST /categories`; compatible with {@link CreateCategoryRequest}. */
export class CreateCategoryDto implements CreateCategoryRequest {
    @IsIn([...CATEGORY_TYPES])
    public type: CreateCategoryRequest['type'];

    @IsString()
    @MinLength(CATEGORY_NAME_MIN_LENGTH)
    @MaxLength(CATEGORY_NAME_MAX_LENGTH)
    public name: string;
}
