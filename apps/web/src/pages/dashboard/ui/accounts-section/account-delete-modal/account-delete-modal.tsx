import { useState } from 'react';
import { InlineNotification, Modal } from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { useTranslation } from 'react-i18next';
import { AccountsApi } from '../../../../../shared/api';
import { ApiError } from '../../../../../shared/api/api-error';

type AccountDeleteModalProps = {
    readonly open: boolean;
    readonly account: Account | null;
    readonly onClose: () => void;
    readonly onDeleted: (account: Account) => void;
};

/**
 * Danger confirmation modal for soft-deleting an account.
 */
export function AccountDeleteModal({ open, account, onClose, onDeleted }: AccountDeleteModalProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onConfirm = async () => {
        if (!account) {
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const deleted = await AccountsApi.deleteAccount(account.id, { version: account.version });
            onDeleted(deleted);
            onClose();
        } catch (reason) {
            if (reason instanceof ApiError && reason.code === 'ACCOUNT_VERSION_CONFLICT') {
                setError(t('accounts.versionConflict'));
            } else {
                setError(t('accounts.deleteError'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            danger
            modalHeading={t('accounts.deleteTitle')}
            modalLabel={account?.name}
            primaryButtonText={t('accounts.actions.delete')}
            secondaryButtonText={t('accounts.actions.cancel')}
            primaryButtonDisabled={isSubmitting || !account}
            loadingStatus={isSubmitting ? 'active' : 'inactive'}
            loadingDescription={t('common.loading')}
            onRequestClose={() => !isSubmitting && onClose()}
            onRequestSubmit={() => {
                void onConfirm();
            }}
            preventCloseOnClickOutside={isSubmitting}
        >
            <p>{t('accounts.deleteBody')}</p>
            {error ? (
                <InlineNotification
                    kind="error"
                    title={t('accounts.cannotDelete')}
                    subtitle={error}
                    lowContrast
                    hideCloseButton
                />
            ) : null}
        </Modal>
    );
}
