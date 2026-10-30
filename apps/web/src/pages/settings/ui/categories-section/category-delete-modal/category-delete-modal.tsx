import { useState } from 'react';
import { InlineNotification, Modal } from '@carbon/react';
import { Category } from '@balance/dto/categories';
import { useTranslation } from 'react-i18next';
import { CategoriesApi } from '../../../../../shared/api';
import { ApiError } from '../../../../../shared/api/api-error';

type CategoryDeleteModalProps = {
    readonly open: boolean;
    readonly category: Category | null;
    readonly onClose: () => void;
    readonly onDeleted: (category: Category) => void;
};

/**
 * Danger confirmation modal for deleting a category.
 */
export function CategoryDeleteModal({ open, category, onClose, onDeleted }: CategoryDeleteModalProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onConfirm = async () => {
        if (!category) {
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const deleted = await CategoriesApi.deleteCategory(category.id, { version: category.version });
            onDeleted(deleted);
            onClose();
        } catch (reason) {
            if (reason instanceof ApiError && reason.code === 'CATEGORY_VERSION_CONFLICT') {
                setError(t('categories.versionConflict'));
            } else {
                setError(t('categories.deleteError'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            danger
            modalHeading={t('categories.deleteTitle')}
            modalLabel={category?.name}
            primaryButtonText={t('categories.actions.delete')}
            secondaryButtonText={t('categories.actions.cancel')}
            primaryButtonDisabled={isSubmitting || !category}
            loadingStatus={isSubmitting ? 'active' : 'inactive'}
            loadingDescription={t('common.loading')}
            onRequestClose={() => !isSubmitting && onClose()}
            onRequestSubmit={() => {
                void onConfirm();
            }}
            preventCloseOnClickOutside={isSubmitting}
        >
            <p>{t('categories.deleteBody')}</p>
            {error ? (
                <InlineNotification
                    kind="error"
                    title={t('categories.cannotDelete')}
                    subtitle={error}
                    lowContrast
                    hideCloseButton
                />
            ) : null}
        </Modal>
    );
}
