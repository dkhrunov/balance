import { Button, ContainedList, ContainedListItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from '../page.module.scss';

export function TransactionsPage() {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Transactions</h2>
                    <p className={styles.subtitle}>Income, expense, and transfers.</p>
                </div>
                <Button kind="primary" size="md" renderIcon={Add}>
                    Add
                </Button>
            </header>

            <ContainedList label="Recent" kind="on-page" className={styles.sectionGap}>
                <ContainedListItem>Groceries · −1 240,00 RUB · you</ContainedListItem>
                <ContainedListItem>Salary · +120 000,00 RUB · Alex</ContainedListItem>
                <ContainedListItem>Transfer Cash → Bank · 5 000,00 RUB · you</ContainedListItem>
            </ContainedList>
        </>
    );
}
