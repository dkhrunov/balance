import { ContainedList, ContainedListItem } from '@carbon/react';
import styles from '../page.module.scss';

export function ProfilePage() {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>Profile</h2>
                    <p className={styles.subtitle}>Your account details (prototype).</p>
                </div>
            </header>
            <ContainedList label="Account" kind="on-page">
                <ContainedListItem>Username · demo</ContainedListItem>
                <ContainedListItem>Role · member</ContainedListItem>
            </ContainedList>
        </>
    );
}
