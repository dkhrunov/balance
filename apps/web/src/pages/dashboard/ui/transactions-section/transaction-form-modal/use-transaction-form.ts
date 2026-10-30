import { useEffect, useMemo, useState } from 'react';
import { Account } from '@balance/dto/accounts';
import { Category } from '@balance/dto/categories';
import { TRANSACTION_DESCRIPTION_MAX_LENGTH, IncomeExpenseType, Transaction } from '@balance/dto/transactions';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../../../shared/api/api-error';
import { todayIsoDate } from '../../../lib/iso-date';
import { validateTransactionAmount } from '../../../model/validate-transaction-amount';
import { saveTransaction } from './save-transaction';

export type TransactionCategoryItem = {
    readonly id: Category['id'];
    readonly label: string;
    readonly icon: string;
};

export type UseTransactionFormArgs = {
    readonly open: boolean;
    /** Create type; ignored when `transaction` is set (edit uses transaction.type). */
    readonly type: IncomeExpenseType;
    readonly transaction: Transaction | null;
    readonly account: Account;
    readonly categories: readonly Category[];
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

export type UseTransactionFormResult = {
    readonly type: IncomeExpenseType;
    readonly categoryId: Category['id'] | null;
    readonly categoryItems: TransactionCategoryItem[];
    readonly amount: string;
    readonly transactionDate: string;
    readonly description: string;
    readonly error: string | null;
    readonly isSubmitting: boolean;
    readonly title: string;
    readonly setCategoryId: (id: Category['id'] | null) => void;
    readonly setAmount: (value: string) => void;
    readonly setTransactionDate: (value: string) => void;
    readonly setDescription: (value: string) => void;
    readonly clearError: () => void;
    readonly submit: (event?: { preventDefault(): void }) => Promise<void>;
};

/**
 * Form state and submit for income/expense create and edit.
 */
export function useTransactionForm({
    open,
    type: createType,
    transaction,
    account,
    categories,
    onClose,
    onSaved,
}: UseTransactionFormArgs): UseTransactionFormResult {
    const { t } = useTranslation();
    const [categoryId, setCategoryId] = useState<Category['id'] | null>(null);
    const [amount, setAmount] = useState('');
    const [transactionDate, setTransactionDate] = useState(todayIsoDate);
    const [description, setDescription] = useState('');
    const [type, setType] = useState<IncomeExpenseType>(createType);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categoryItems: TransactionCategoryItem[] = useMemo(
        () =>
            categories.map((category) => ({
                id: category.id,
                label: category.name,
                icon: category.icon,
            })),
        [categories],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setIsSubmitting(false);

        if (transaction) {
            const nextType: IncomeExpenseType = transaction.type === 'INCOME' ? 'INCOME' : 'EXPENSE';

            setType(nextType);
            setAmount(transaction.amount);
            setTransactionDate(transaction.transactionDate);
            setDescription(transaction.description);
            setCategoryId(transaction.categoryId);
            return;
        }

        setType(createType);
        setAmount('');
        setTransactionDate(todayIsoDate());
        setDescription('');
        setCategoryId(null);
    }, [open, account.id, transaction, createType]);

    useEffect(() => {
        if (!categoryItems.some((item) => item.id === categoryId)) {
            setCategoryId(categoryItems[0]?.id ?? null);
        }
    }, [categoryItems, categoryId]);

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

        if (!categoryId) {
            setError(t('transactions.validation.category'));
            return;
        }

        setIsSubmitting(true);

        try {
            await saveTransaction({
                existing: transaction,
                type,
                accountId: account.id,
                categoryId,
                currency: account.currency,
                amount: validated.amount,
                transactionDate,
                description,
            });
            onSaved();
            onClose();
        } catch (reason) {
            setError(mapTransactionSaveError(reason, t));
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = transaction ? t('transactions.editTitle') : t('transactions.createTitle');

    return {
        type,
        categoryId,
        categoryItems,
        amount,
        transactionDate,
        description,
        error,
        isSubmitting,
        title,
        setCategoryId,
        setAmount,
        setTransactionDate: (value: string) => {
            setTransactionDate(value);
        },
        setDescription: (value: string) => {
            setDescription(value.slice(0, TRANSACTION_DESCRIPTION_MAX_LENGTH));
        },
        clearError: () => setError(null),
        submit,
    };
}

function mapTransactionSaveError(reason: unknown, t: (key: string) => string): string {
    if (reason instanceof ApiError && reason.code === 'TRANSACTION_INSUFFICIENT_FUNDS') {
        return t('transactions.validation.insufficientFunds');
    }

    return t('transactions.saveError');
}
