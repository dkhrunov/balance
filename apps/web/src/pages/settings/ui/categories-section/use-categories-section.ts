import { useState } from 'react';
import { Category, CategoryType } from '@balance/dto/categories';
import { useCategories } from '../../../../entities/category';
import { LoadState } from '../../../../shared/lib/load-state';

export type UseCategoriesSectionResult = {
    readonly income: readonly Category[];
    readonly expense: readonly Category[];
    readonly loadState: LoadState;
    readonly loadError: string | null;
    readonly formOpen: boolean;
    readonly editing: Category | null;
    readonly categoryType: CategoryType;
    readonly deleting: Category | null;
    readonly reload: () => Promise<void>;
    readonly openCreate: (type: CategoryType) => void;
    readonly openEdit: (category: Category) => void;
    readonly closeForm: () => void;
    readonly openDelete: (category: Category) => void;
    readonly closeDelete: () => void;
    readonly applySaved: (saved: Category) => void;
    readonly applyDeleted: (deleted: Category) => void;
};

/**
 * Settings categories UI orchestration; list data comes from {@link useCategories}.
 */
export function useCategoriesSection(): UseCategoriesSectionResult {
    const { income, expense, loadState, loadError, reloadCategories, upsertCategory, removeCategory } = useCategories();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [categoryType, setCategoryType] = useState<CategoryType>('EXPENSE');
    const [deleting, setDeleting] = useState<Category | null>(null);

    return {
        income: income,
        expense: expense,
        loadState: loadState,
        loadError: loadError,
        formOpen,
        editing,
        categoryType,
        deleting,
        reload: reloadCategories,
        openCreate: (type) => {
            setEditing(null);
            setCategoryType(type);
            setFormOpen(true);
        },
        openEdit: (category) => {
            setEditing(category);
            setFormOpen(true);
        },
        closeForm: () => {
            setFormOpen(false);
            setEditing(null);
        },
        openDelete: setDeleting,
        closeDelete: () => setDeleting(null),
        applySaved: (saved) => {
            upsertCategory(saved);
        },
        applyDeleted: (deleted) => {
            removeCategory(deleted.id);
        },
    };
}
