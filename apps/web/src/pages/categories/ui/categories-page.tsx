import { Button, ContainedList, ContainedListItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageShell } from '../../../shared/ui/page';
import styles from './categories-page.module.scss';

export function CategoriesPage() {
    return (
        <PageShell
            title="Categories"
            subtitle="Separate income and expense categories."
            actions={
                <Button kind="primary" size="md" renderIcon={Add}>
                    Add
                </Button>
            }
        >
            <ContainedList label="Expense" kind="on-page">
                <ContainedListItem>Food</ContainedListItem>
                <ContainedListItem>Transport</ContainedListItem>
            </ContainedList>
            <ContainedList label="Income" kind="on-page" className={styles.sectionGap}>
                <ContainedListItem>Salary</ContainedListItem>
                <ContainedListItem>Other</ContainedListItem>
            </ContainedList>
        </PageShell>
    );
}
