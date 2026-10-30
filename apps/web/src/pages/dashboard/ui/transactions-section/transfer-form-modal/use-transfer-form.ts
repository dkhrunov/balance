import { useEffect, useMemo, useState } from 'react';
import { Account } from '@balance/dto/accounts';
import { TRANSACTION_DESCRIPTION_MAX_LENGTH, Transaction, TransferType } from '@balance/dto/transactions';
import { useTranslation } from 'react-i18next';
import { useAccounts } from '../../../../../entities/account';
import { ApiError } from '../../../../../shared/api/api-error';
import { todayIsoDate } from '../../../lib/iso-date';
import { validateTransactionAmount } from '../../../model/validate-transaction-amount';
import { saveTransfer } from './save-transfer';

export type TransferAccountItem = {
    readonly id: Account['id'];
    readonly label: string;
    readonly icon: string;
};

export type UseTransferFormArgs = {
    readonly open: boolean;
    readonly transaction: Transaction | null;
    readonly account: Account;
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

export type UseTransferFormResult = {
    readonly type: TransferType;
    readonly otherAccountId: Account['id'] | null;
    readonly transferTargets: TransferAccountItem[];
    readonly amount: string;
    readonly transactionDate: string;
    readonly description: string;
    readonly error: string | null;
    readonly isSubmitting: boolean;
    readonly title: string;
    readonly setOtherAccountId: (id: Account['id'] | null) => void;
    readonly setAmount: (value: string) => void;
    readonly setTransactionDate: (value: string) => void;
    readonly setDescription: (value: string) => void;
    readonly clearError: () => void;
    readonly submit: (event?: { preventDefault(): void }) => Promise<void>;
};

/**
 * Form state and submit for transfer create (always TRANSFER_OUT) and edit.
 */
export function useTransferForm({
    open,
    transaction,
    account,
    onClose,
    onSaved,
}: UseTransferFormArgs): UseTransferFormResult {
    const { t } = useTranslation();
    const { accounts } = useAccounts();
    const [type, setType] = useState<TransferType>('TRANSFER_OUT');
    const [otherAccountId, setOtherAccountId] = useState<Account['id'] | null>(null);
    const [amount, setAmount] = useState('');
    const [transactionDate, setTransactionDate] = useState(todayIsoDate);
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const transferTargets: TransferAccountItem[] = useMemo(
        () =>
            accounts
                .filter((item) => item.id !== account.id && item.currency === account.currency)
                .map((item) => ({ id: item.id, label: item.name, icon: item.icon })),
        [accounts, account.id, account.currency],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setIsSubmitting(false);

        if (transaction) {
            const nextType: TransferType = transaction.type === 'TRANSFER_IN' ? 'TRANSFER_IN' : 'TRANSFER_OUT';

            setType(nextType);
            setAmount(transaction.amount);
            setTransactionDate(transaction.transactionDate);
            setDescription(transaction.description);
            setOtherAccountId(transferTargets[0]?.id ?? null);
            return;
        }

        setType('TRANSFER_OUT');
        setAmount('');
        setTransactionDate(todayIsoDate());
        setDescription('');
        setOtherAccountId(transferTargets[0]?.id ?? null);
    }, [open, account.id, transaction, transferTargets]);

    const submit = async (event?: { preventDefault(): void }) => {
        event?.preventDefault();
        setError(null);

        const validated = validateTransactionAmount({
            amount,
            currency: account.currency,
            transactionDate,
        });

        if (!validated.ok) {
            setError(t(validated.error));
            return;
        }

        if (!otherAccountId) {
            setError(t('transactions.validation.transferTarget'));
            return;
        }

        setIsSubmitting(true);

        try {
            await saveTransfer({
                existing: transaction,
                type,
                accountId: account.id,
                otherAccountId: otherAccountId,
                currency: account.currency,
                amount: validated.amount,
                transactionDate,
                description,
            });
            onSaved();
            onClose();
        } catch (reason) {
            setError(mapTransferSaveError(reason, t));
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = transaction ? t('transactions.editTitle') : t('transactions.createTitle');

    return {
        type,
        otherAccountId: otherAccountId,
        transferTargets,
        amount,
        transactionDate,
        description,
        error,
        isSubmitting,
        title,
        setOtherAccountId: setOtherAccountId,
        setAmount,
        setTransactionDate,
        setDescription: (value: string) => {
            setDescription(value.slice(0, TRANSACTION_DESCRIPTION_MAX_LENGTH));
        },
        clearError: () => setError(null),
        submit,
    };
}

function mapTransferSaveError(reason: unknown, t: (key: string) => string): string {
    if (reason instanceof ApiError && reason.code === 'TRANSACTION_INSUFFICIENT_FUNDS') {
        return t('transactions.validation.insufficientFunds');
    }

    return t('transactions.saveError');
}
