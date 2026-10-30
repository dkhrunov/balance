import { Button, Column, Grid, InlineLoading, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { CategoryDeleteModal } from './category-delete-modal';
import { CategoryFormModal } from './category-form-modal';
import { CategoryList } from './category-list';
import { useCategoriesSection } from './use-categories-section';
import styles from './categories-section.module.scss';

/**
 * Settings categories manage: income/expense ContainedLists with ComposedModal CRUD.
 */
export function CategoriesSection() {
    const { t } = useTranslation();
    const section = useCategoriesSection();

    return (
        <section className={styles.section} aria-labelledby="settings-categories-heading">
            <h4 id="settings-categories-heading" className={styles.title}>
                {t('categories.title')}
            </h4>

            {/* TODO skeleton */}
            {section.loadState === 'loading' ? (
                <InlineLoading description={t('common.loading')} />
            ) : null}

            {section.loadState === 'error' && section.loadError ? (
                <>
                    <InlineNotification
                        kind="error"
                        title={t('categories.cannotLoad')}
                        subtitle={section.loadError}
                        lowContrast
                        hideCloseButton
                    />
                    <Button kind="ghost" size="sm" onClick={() => void section.reload()}>
                        {t('categories.actions.retry')}
                    </Button>
                </>
            ) : null}

            {section.loadState === 'ready' ? (
                <Grid fullWidth>
                    <Column sm={4} md={4} lg={8}>
                        <CategoryList
                            title={t('categories.types.INCOME')}
                            categories={section.income}
                            emptyTitle={t('categories.emptyIncome')}
                            emptyBody={t('categories.emptyIncomeBody')}
                            onAdd={() => section.openCreate('INCOME')}
                            onEdit={section.openEdit}
                            onDelete={section.openDelete}
                        />
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                        <CategoryList
                            title={t('categories.types.EXPENSE')}
                            categories={section.expense}
                            emptyTitle={t('categories.emptyExpense')}
                            emptyBody={t('categories.emptyExpenseBody')}
                            onAdd={() => section.openCreate('EXPENSE')}
                            onEdit={section.openEdit}
                            onDelete={section.openDelete}
                        />
                    </Column>
                </Grid>
            ) : null}

            <CategoryFormModal
                open={section.formOpen}
                category={section.editing}
                type={section.categoryType}
                onClose={section.closeForm}
                onSaved={section.applySaved}
            />

            <CategoryDeleteModal
                open={section.deleting !== null}
                category={section.deleting}
                onClose={section.closeDelete}
                onDeleted={section.applyDeleted}
            />
        </section>
    );
}
