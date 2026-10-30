import { FormEventHandler } from 'react';
import {
    ComposedModal,
    FluidTextInput,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from '@carbon/react';
import { Category, CategoryType } from '@balance/dto/categories';
import { useTranslation } from 'react-i18next';
import { FluidIconPicker } from '../../../../../shared/ui/icon';
import { useCategoryForm } from './use-category-form';
import styles from './category-form-modal.module.scss';

type CategoryFormModalProps = {
    readonly open: boolean;
    readonly category: Category | null;
    readonly type: CategoryType;
    readonly onClose: () => void;
    readonly onSaved: (category: Category) => void;
};

/**
 * Create/edit category form in a transactional ComposedModal.
 * Fluid controls + `isFullWidth`. Create type comes from {@link type}.
 */
export function CategoryFormModal({
    open,
    category,
    type,
    onClose,
    onSaved,
}: CategoryFormModalProps) {
    const { t } = useTranslation();
    const form = useCategoryForm({ open, category, type, onClose, onSaved });

    const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        void form.submit(event);
    };

    return (
        <ComposedModal
            open={open}
            size="sm"
            isFullWidth
            onClose={() => !form.isSubmitting && onClose()}
            preventCloseOnClickOutside={form.isSubmitting}
        >
            <ModalHeader
                title={form.isEdit ? t('categories.editTitle') : t('categories.createTitle')}
                label={t(`categories.types.${form.categoryType}`)}
            />
            <ModalBody hasForm>
                <form id="category-form" onSubmit={handleFormSubmit} noValidate>
                    {form.error ? (
                        <InlineNotification
                            kind="error"
                            title={t('categories.cannotSave')}
                            subtitle={form.error}
                            lowContrast
                            hideCloseButton
                        />
                    ) : null}

                    <div className={styles.iconNameRow}>
                        <FluidIconPicker
                            labelText={t('categories.fields.icon')}
                            value={form.icon}
                            disabled={form.isSubmitting}
                            onChange={(next) => {
                                form.setIcon(next);
                                form.clearError();
                            }}
                        />
                        <div className={styles.nameField}>
                            <FluidTextInput
                                id="category-name"
                                labelText={t('categories.fields.name')}
                                value={form.name}
                                disabled={form.isSubmitting}
                                onChange={(event) => {
                                    form.setName(event.target.value);
                                    form.clearError();
                                }}
                            />
                        </div>
                    </div>
                </form>
            </ModalBody>
            <ModalFooter
                primaryButtonText={
                    form.isEdit ? t('categories.actions.save') : t('categories.actions.create')
                }
                secondaryButtonText={t('categories.actions.cancel')}
                primaryButtonDisabled={form.isSubmitting}
                loadingStatus={form.isSubmitting ? 'active' : 'inactive'}
                loadingDescription={t('common.loading')}
                onRequestSubmit={() => {
                    void form.submit();
                }}
                onRequestClose={onClose}
            >
                {null}
            </ModalFooter>
        </ComposedModal>
    );
}
