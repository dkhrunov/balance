import { Button, ContainedList, ContainedListItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageShell } from '../../../shared/ui/page';

export function AccountsPage() {
    return (
        <PageShell
            title="Accounts"
            subtitle="Balances stay in each account currency."
            actions={
                <Button kind="primary" size="md" renderIcon={Add}>
                    Add
                </Button>
            }
        >
            <ContainedList label="Accounts" kind="on-page">
                <ContainedListItem>Cash · 12 450,00 RUB</ContainedListItem>
                <ContainedListItem>Bank · 84 200,50 RUB</ContainedListItem>
                <ContainedListItem>USD card · 320,00 USD</ContainedListItem>
            </ContainedList>
        </PageShell>
    );
}
