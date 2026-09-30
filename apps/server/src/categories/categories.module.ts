import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import {
    CATEGORIES_REPOSITORY,
    CREATE_CATEGORY_USE_CASE,
    CreateCategoryUseCase,
    DELETE_CATEGORY_USE_CASE,
    DeleteCategoryUseCase,
    GET_CATEGORY_USE_CASE,
    GetCategoryUseCase,
    LIST_CATEGORIES_USE_CASE,
    ListCategoriesUseCase,
    UPDATE_CATEGORY_USE_CASE,
    UpdateCategoryUseCase,
} from './application';
import { CategoriesController } from './adapters/inbound';
import { PgCategoriesRepository } from './adapters/outbound';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [CategoriesController],
    providers: [
        { provide: CATEGORIES_REPOSITORY, useClass: PgCategoriesRepository },
        { provide: LIST_CATEGORIES_USE_CASE, useClass: ListCategoriesUseCase },
        { provide: GET_CATEGORY_USE_CASE, useClass: GetCategoryUseCase },
        { provide: CREATE_CATEGORY_USE_CASE, useClass: CreateCategoryUseCase },
        { provide: UPDATE_CATEGORY_USE_CASE, useClass: UpdateCategoryUseCase },
        { provide: DELETE_CATEGORY_USE_CASE, useClass: DeleteCategoryUseCase },
    ],
    exports: [
        LIST_CATEGORIES_USE_CASE,
        GET_CATEGORY_USE_CASE,
        CREATE_CATEGORY_USE_CASE,
        UPDATE_CATEGORY_USE_CASE,
        DELETE_CATEGORY_USE_CASE,
    ],
})
export class CategoriesModule {}
