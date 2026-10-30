import { useState } from 'react';
import { Account } from '@balance/dto/accounts';
import { useTranslation } from 'react-i18next';
import { useAccounts } from '../../../entities/account';
import { PageShell } from '../../../shared/ui/page';
import { useAccountTransactions } from '../lib/use-account-transactions';
import { AccountsSection } from './accounts-section';
import { SummarySection } from './summary-section';
import { TransactionsSection } from './transactions-section';

export function DashboardPage() {
    const { t } = useTranslation();
    const [selectedAccountId, setSelectedAccountId] = useState<Account['id'] | null>(null);
    const { accountsMap } = useAccounts();
    const {
        transactions,
        loadState: transactionsLoadState,
        reload: reloadTransactions,
    } = useAccountTransactions(selectedAccountId);

    const selectedAccount =
        selectedAccountId === null ? null : (accountsMap.get(selectedAccountId) ?? null);

    return (
        <PageShell title={t('dashboard.title')}>
            <SummarySection
                account={selectedAccount}
                transactions={transactions}
                transactionsLoadState={transactionsLoadState}
            />
            <AccountsSection
                selectedAccountId={selectedAccountId}
                selectedAccountTransactions={transactions}
                onSelectAccountId={setSelectedAccountId}
            />
            <TransactionsSection
                account={selectedAccount}
                transactions={transactions}
                transactionsLoadState={transactionsLoadState}
                onTransactionsChanged={() => {
                    void reloadTransactions();
                }}
            />
        </PageShell>
    );
}
