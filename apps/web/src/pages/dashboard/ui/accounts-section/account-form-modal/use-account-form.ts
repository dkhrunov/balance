import { useEffect, useState } from 'react';
import { Account, ACCOUNT_NAME_MAX_LENGTH, DEFAULT_ACCOUNT_ICON } from '@balance/dto/accounts';
import { CURRENCY_CODES, CurrencyCode } from '@balance/dto/currencies';
import { Money } from '@balance/domain/money';
import { useTranslation } from 'react-i18next';
import { AccountsApi } from '../../../../../shared/api';
import { ApiError } from '../../../../../shared/api/api-error';
import { IconName, coerceIconName } from '../../../../../shared/ui/icon';

export type AccountCurrencyItem = {
    readonly id: CurrencyCode;
    readonly label: string;
};

export type UseAccountFormArgs = {
    readonly open: boolean;
    readonly account: Account | null;
    readonly onClose: () => void;
    readonly onSaved: (account: Account) => void;
};

export type UseAccountFormResult = {
    readonly isEdit: boolean;
    readonly name: string;
    readonly icon: IconName;
    readonly currency: CurrencyCode;
    readonly initialBalance: string;
    readonly currencyItems: AccountCurrencyItem[];
    readonly error: string | null;
    readonly isSubmitting: boolean;
    readonly setName: (value: string) => void;
    readonly setIcon: (value: IconName) => void;
    readonly setCurrency: (value: CurrencyCode) => void;
    readonly setInitialBalance: (value: string) => void;
    readonly clearError: () => void;
    readonly submit: (event?: { preventDefault(): void }) => Promise<void>;
};

/**
 * Create/edit account form state and submit.
 */
export function useAccountForm({ open, account, onClose, onSaved }: UseAccountFormArgs): UseAccountFormResult {
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [icon, setIcon] = useState<IconName>(DEFAULT_ACCOUNT_ICON as IconName);
    const [currency, setCurrency] = useState<CurrencyCode>('RUB');
    const [initialBalance, setInitialBalance] = useState('0');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = account !== null;

    const currencyItems: AccountCurrencyItem[] = CURRENCY_CODES.map((code) => ({
        id: code,
        label: code,
    }));

    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setIsSubmitting(false);

        if (account) {
            setName(account.name);
            setIcon(coerceIconName(account.icon));
            setCurrency(account.currency);
            setInitialBalance(account.initialBalance);
            return;
        }

        setName('');
        setIcon(coerceIconName(DEFAULT_ACCOUNT_ICON));
        setCurrency('RUB');
        setInitialBalance('0');
    }, [open, account]);

    const submit = async (event?: { preventDefault(): void }) => {
        event?.preventDefault();
        setError(null);

        const trimmedName = name.trim();

        if (trimmedName.length < 1 || trimmedName.length > ACCOUNT_NAME_MAX_LENGTH) {
            setError(t('accounts.validation.name'));
            return;
        }

        if (!isEdit) {
            try {
                Money.create(currency, initialBalance || '0');
            } catch {
                setError(t('accounts.validation.balance'));
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const saved = isEdit
                ? await AccountsApi.updateAccount(account.id, {
                      name: trimmedName,
                      icon,
                      version: account.version,
                  })
                : await AccountsApi.createAccount({
                      name: trimmedName,
                      currency,
                      initialBalance: Money.create(currency, initialBalance || '0').amount,
                      icon,
                  });

            onSaved(saved);
            onClose();
        } catch (reason) {
            setError(mapAccountSaveError(reason, t));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isEdit,
        name,
        icon,
        currency,
        initialBalance,
        currencyItems,
        error,
        isSubmitting,
        setName,
        setIcon,
        setCurrency,
        setInitialBalance,
        clearError: () => setError(null),
        submit,
    };
}

function mapAccountSaveError(reason: unknown, t: (key: string) => string): string {
    if (reason instanceof ApiError) {
        if (reason.code === 'ACCOUNT_VERSION_CONFLICT') {
            return t('accounts.versionConflict');
        }

        if (reason.status === 400) {
            return t('accounts.validation.generic');
        }
    }

    return t('accounts.saveError');
}
