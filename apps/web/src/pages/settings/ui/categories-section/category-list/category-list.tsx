import { ContainedList, ContainedListItem, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { Category } from '@balance/dto/categories';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../../../shared/ui/empty-state';
import { resolveIcon } from '../../../../../shared/ui/icon';

type CategoryListProps = {
    readonly title: string;
    readonly categories: readonly Category[];
    readonly emptyTitle: string;
    readonly emptyBody: string;
    readonly onAdd: () => void;
    readonly onEdit: (category: Category) => void;
    readonly onDelete: (category: Category) => void;
};

/**
 * One ContainedList of categories (income or expense) with add/edit/delete actions.
 * Private to the categories section slice (not re-exported from the barrel).
 */
export function CategoryList({
    title,
    categories,
    emptyTitle,
    emptyBody,
    onAdd,
    onEdit,
    onDelete,
}: CategoryListProps) {
    const { t } = useTranslation();

    return (
        <ContainedList
            label={title}
            kind="on-page"
            size="md"
            action={
                <IconButton kind="ghost" label={t('categories.actions.add')} onClick={onAdd}>
                    <Add />
                </IconButton>
            }
        >
            {categories.length === 0 ? (
                <ContainedListItem>
                    <EmptyState title={emptyTitle} body={emptyBody} />
                </ContainedListItem>
            ) : (
                categories.map((category) => (
                    <ContainedListItem
                        key={category.id}
                        renderIcon={resolveIcon(category.icon)}
                        action={
                            <>
                                <IconButton
                                    kind="ghost"
                                    label={t('categories.actions.edit')}
                                    onClick={() => onEdit(category)}
                                >
                                    <Edit />
                                </IconButton>
                                <IconButton
                                    kind="ghost"
                                    label={t('categories.actions.delete')}
                                    onClick={() => onDelete(category)}
                                >
                                    <TrashCan />
                                </IconButton>
                            </>
                        }
                    >
                        {category.name}
                    </ContainedListItem>
                ))
            )}
        </ContainedList>
    );
}
