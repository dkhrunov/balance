import { useEffect, useState } from 'react';
import {
    CATEGORY_NAME_MAX_LENGTH,
    Category,
    CategoryType,
    DEFAULT_CATEGORY_ICON,
} from '@balance/dto/categories';
import { useTranslation } from 'react-i18next';
import { CategoriesApi } from '../../../../../shared/api';
import { ApiError } from '../../../../../shared/api/api-error';
import { IconName, coerceIconName } from '../../../../../shared/ui/icon';

export type UseCategoryFormArgs = {
    readonly open: boolean;
    readonly category: Category | null;
    readonly type: CategoryType;
    readonly onClose: () => void;
    readonly onSaved: (category: Category) => void;
};

export type UseCategoryFormResult = {
    readonly isEdit: boolean;
    readonly name: string;
    readonly icon: IconName;
    readonly categoryType: CategoryType;
    readonly error: string | null;
    readonly isSubmitting: boolean;
    readonly setName: (value: string) => void;
    readonly setIcon: (value: IconName) => void;
    readonly clearError: () => void;
    readonly submit: (event?: { preventDefault(): void }) => Promise<void>;
};

/**
 * Create/edit category form state and submit.
 */
export function useCategoryForm({
    open,
    category,
    type,
    onClose,
    onSaved,
}: UseCategoryFormArgs): UseCategoryFormResult {
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [icon, setIcon] = useState<IconName>(DEFAULT_CATEGORY_ICON as IconName);
    const [categoryType, setCategoryType] = useState<CategoryType>(type);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = category !== null;

    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setIsSubmitting(false);

        if (category) {
            setName(category.name);
            setIcon(coerceIconName(category.icon));
            setCategoryType(category.type);
            return;
        }

        setName('');
        setIcon(coerceIconName(DEFAULT_CATEGORY_ICON));
        setCategoryType(type);
    }, [open, category, type]);

    const submit = async (event?: { preventDefault(): void }) => {
        event?.preventDefault();
        setError(null);

        const trimmedName = name.trim();

        if (trimmedName.length < 1 || trimmedName.length > CATEGORY_NAME_MAX_LENGTH) {
            setError(t('categories.validation.name'));
            return;
        }

        setIsSubmitting(true);

        try {
            const saved = isEdit
                ? await CategoriesApi.updateCategory(category.id, {
                      name: trimmedName,
                      icon,
                      version: category.version,
                  })
                : await CategoriesApi.createCategory({
                      name: trimmedName,
                      type: categoryType,
                      icon,
                  });

            onSaved(saved);
            onClose();
        } catch (reason) {
            setError(mapCategorySaveError(reason, t));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isEdit,
        name,
        icon,
        categoryType,
        error,
        isSubmitting,
        setName,
        setIcon,
        clearError: () => setError(null),
        submit,
    };
}

function mapCategorySaveError(reason: unknown, t: (key: string) => string): string {
    if (reason instanceof ApiError) {
        if (reason.code === 'CATEGORY_VERSION_CONFLICT') {
            return t('categories.versionConflict');
        }

        if (reason.status === 400) {
            return t('categories.validation.generic');
        }
    }

    return t('categories.saveError');
}
