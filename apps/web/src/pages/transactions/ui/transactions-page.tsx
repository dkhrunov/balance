import { Button, ContainedList, ContainedListItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageShell } from '../../../shared/ui/page';
import styles from './transactions-page.module.scss';

export function TransactionsPage() {
    return (
        <PageShell
            title="Transactions"
            subtitle="Income, expense, and transfers."
            actions={
                <Button kind="primary" size="md" renderIcon={Add}>
                    Add
                </Button>
            }
        >
            <ContainedList label="Recent" kind="on-page" className={styles.sectionGap}>
                <ContainedListItem>Groceries · −1 240,00 RUB · you</ContainedListItem>
                <ContainedListItem>Salary · +120 000,00 RUB · Alex</ContainedListItem>
                <ContainedListItem>Transfer Cash → Bank · 5 000,00 RUB · you</ContainedListItem>
            </ContainedList>
        </PageShell>
    );
}
