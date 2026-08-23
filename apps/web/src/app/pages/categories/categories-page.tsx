import { Button, ContainedList, ContainedListItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from '../page.module.scss';

export function CategoriesPage() {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Categories</h2>
                    <p className={styles.subtitle}>Separate income and expense categories.</p>
                </div>
                <Button kind="primary" size="md" renderIcon={Add}>
                    Add
                </Button>
            </header>
            <ContainedList label="Expense" kind="on-page">
                <ContainedListItem>Food</ContainedListItem>
                <ContainedListItem>Transport</ContainedListItem>
            </ContainedList>
            <ContainedList label="Income" kind="on-page" className={styles.sectionGap}>
                <ContainedListItem>Salary</ContainedListItem>
                <ContainedListItem>Other</ContainedListItem>
            </ContainedList>
        </>
    );
}
