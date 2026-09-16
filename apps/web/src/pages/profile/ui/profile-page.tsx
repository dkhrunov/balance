import { ContainedList, ContainedListItem } from '@carbon/react';
import { useAuth } from '../../../shared/auth';
import { PageShell } from '../../../shared/ui/page';

export function ProfilePage() {
    const { user } = useAuth();

    return (
        <PageShell title="Profile" subtitle="Your account details.">
            <ContainedList label="Account" kind="on-page">
                <ContainedListItem>Email · {user?.email ?? '—'}</ContainedListItem>
                <ContainedListItem>Display name · {user?.displayName ?? '—'}</ContainedListItem>
            </ContainedList>
        </PageShell>
    );
}
