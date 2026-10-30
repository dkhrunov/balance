import { Button, Column, Grid, InlineNotification } from '@carbon/react';
import { AsciiReveal, AsciiSkeleton } from 'ascii-reveal';
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

    const showSkeleton = section.loadState === 'loading';
    const showContent = section.loadState === 'ready';
    const showError = section.loadState === 'error';

    return (
        <section className={styles.section} aria-labelledby="settings-categories-heading">
            <h4 id="settings-categories-heading" className={styles.title}>
                {t('categories.title')}
            </h4>

            <AsciiReveal loading={showSkeleton}>
                {showSkeleton ? (
                    <Grid fullWidth aria-hidden>
                        <Column sm={4} md={4} lg={8}>
                            <AsciiSkeleton
                                lines={6}
                                widths={['40%', '100%', '100%', '90%', '100%', '80%']}
                                seed={1}
                            />
                        </Column>
                        <Column sm={4} md={4} lg={8}>
                            <AsciiSkeleton
                                lines={12}
                                widths={[
                                    '40%',
                                    '100%',
                                    '90%',
                                    '100%',
                                    '80%',
                                    '100%',
                                    '90%',
                                    '100%',
                                    '80%',
                                    '100%',
                                    '90%',
                                    '100%',
                                ]}
                                seed={2}
                            />
                        </Column>
                    </Grid>
                ) : null}

                {showContent ? (
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

                {showError ? (
                    <>
                        <InlineNotification
                            kind="error"
                            title={t('categories.cannotLoad')}
                            subtitle={section.loadError ?? undefined}
                            lowContrast
                            hideCloseButton
                        />
                        <Button kind="ghost" size="sm" onClick={() => void section.reload()}>
                            {t('categories.actions.retry')}
                        </Button>
                    </>
                ) : null}
            </AsciiReveal>

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
