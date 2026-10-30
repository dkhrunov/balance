import { useState } from 'react';
import { InlineNotification, Modal } from '@carbon/react';
import { Transaction } from '@balance/dto/transactions';
import { useTranslation } from 'react-i18next';
import { TransactionsApi } from '../../../../../shared/api';
import { ApiError } from '../../../../../shared/api/api-error';

type TransactionDeleteModalProps = {
    readonly open: boolean;
    readonly transaction: Transaction | null;
    readonly onClose: () => void;
    readonly onDeleted: () => void;
};

/**
 * Danger confirmation modal for soft-deleting a transaction.
 */
export function TransactionDeleteModal({
    open,
    transaction,
    onClose,
    onDeleted,
}: TransactionDeleteModalProps) {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onConfirm = async () => {
        if (!transaction) {
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            await TransactionsApi.deleteTransaction(transaction.id, { version: transaction.version });
            onDeleted();
            onClose();
        } catch (reason) {
            if (reason instanceof ApiError && reason.code === 'TRANSACTION_VERSION_CONFLICT') {
                setError(t('transactions.versionConflict'));
            } else {
                setError(t('transactions.deleteError'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            danger
            modalHeading={t('transactions.deleteTitle')}
            primaryButtonText={t('transactions.actions.delete')}
            secondaryButtonText={t('transactions.actions.cancel')}
            primaryButtonDisabled={isSubmitting || !transaction}
            loadingStatus={isSubmitting ? 'active' : 'inactive'}
            loadingDescription={t('common.loading')}
            onRequestClose={() => !isSubmitting && onClose()}
            onRequestSubmit={() => {
                void onConfirm();
            }}
            preventCloseOnClickOutside={isSubmitting}
        >
            <p>{t('transactions.deleteBody')}</p>
            {error ? (
                <InlineNotification
                    kind="error"
                    title={t('transactions.cannotDelete')}
                    subtitle={error}
                    lowContrast
                    hideCloseButton
                />
            ) : null}
        </Modal>
    );
}
