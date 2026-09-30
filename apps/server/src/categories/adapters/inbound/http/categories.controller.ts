import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    Category,
    CATEGORY_ERROR_CODES,
    CATEGORY_TYPES,
    CategoryType,
    CreateCategoryRequest,
    DeleteCategoryRequest,
    ListCategoriesResponse,
    UpdateCategoryRequest,
} from '@balance/dto/categories';
import { UserIdentity } from '@balance/dto/users';
import { AuthGuard, CurrentUser, CsrfOriginGuard } from '../../../../auth/adapters/inbound';
import {
    CREATE_CATEGORY_USE_CASE,
    DELETE_CATEGORY_USE_CASE,
    GET_CATEGORY_USE_CASE,
    ICreateCategoryUseCase,
    IDeleteCategoryUseCase,
    IGetCategoryUseCase,
    IListCategoriesUseCase,
    IUpdateCategoryUseCase,
    LIST_CATEGORIES_USE_CASE,
    UPDATE_CATEGORY_USE_CASE,
} from '../../../application';
import { CreateCategoryDto } from './dto/create-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
    public constructor(
        @Inject(LIST_CATEGORIES_USE_CASE)
        private readonly listCategoriesUseCase: IListCategoriesUseCase,
        @Inject(GET_CATEGORY_USE_CASE)
        private readonly getCategoryUseCase: IGetCategoryUseCase,
        @Inject(CREATE_CATEGORY_USE_CASE)
        private readonly createCategoryUseCase: ICreateCategoryUseCase,
        @Inject(UPDATE_CATEGORY_USE_CASE)
        private readonly updateCategoryUseCase: IUpdateCategoryUseCase,
        @Inject(DELETE_CATEGORY_USE_CASE)
        private readonly deleteCategoryUseCase: IDeleteCategoryUseCase,
    ) {}

    @Get()
    @UseGuards(AuthGuard)
    public getCategories(@Query('type') type?: string): Promise<ListCategoriesResponse> {
        const filter = this.parseOptionalType(type);

        return this.listCategoriesUseCase.execute(filter);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    public getCategory(@Param('id') categoryId: string): Promise<Category> {
        return this.getCategoryUseCase.execute(categoryId);
    }

    @Post()
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public createCategory(@CurrentUser() user: UserIdentity, @Body() body: CreateCategoryDto): Promise<Category> {
        const payload: CreateCategoryRequest = {
            type: body.type,
            name: body.name,
            icon: body.icon,
        };

        return this.createCategoryUseCase.execute(user.id, payload);
    }

    @Put(':id')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public updateCategory(
        @CurrentUser() user: UserIdentity,
        @Param('id') categoryId: string,
        @Body() body: UpdateCategoryDto,
    ): Promise<Category> {
        const payload: UpdateCategoryRequest = {
            name: body.name,
            icon: body.icon,
            version: body.version,
        };

        return this.updateCategoryUseCase.execute(user.id, categoryId, payload);
    }

    @Delete(':id')
    @UseGuards(CsrfOriginGuard, AuthGuard)
    public deleteCategory(
        @CurrentUser() user: UserIdentity,
        @Param('id') categoryId: string,
        @Body() body: DeleteCategoryDto,
    ): Promise<Category> {
        const payload: DeleteCategoryRequest = {
            version: body.version,
        };

        return this.deleteCategoryUseCase.execute(user.id, categoryId, payload);
    }

    private parseOptionalType(type: string | undefined): CategoryType | undefined {
        if (type === undefined || type === '') {
            return undefined;
        }

        if ((CATEGORY_TYPES as readonly string[]).includes(type)) {
            return type as CategoryType;
        }

        throw new BadRequestException({
            code: CATEGORY_ERROR_CODES.validationFailed,
            message: `Category type must be ${CATEGORY_TYPES.join(' or ')}`,
            details: {},
        });
    }
}
