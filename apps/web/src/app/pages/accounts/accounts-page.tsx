import { Button, ContainedList, ContainedListItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from '../page.module.scss';

export function AccountsPage() {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Accounts</h2>
                    <p className={styles.subtitle}>Balances stay in each account currency.</p>
                </div>
                <Button kind="primary" size="md" renderIcon={Add}>
                    Add
                </Button>
            </header>
            <ContainedList label="Accounts" kind="on-page">
                <ContainedListItem>Cash · 12 450,00 RUB</ContainedListItem>
                <ContainedListItem>Bank · 84 200,50 RUB</ContainedListItem>
                <ContainedListItem>USD card · 320,00 USD</ContainedListItem>
            </ContainedList>
        </>
    );
}
