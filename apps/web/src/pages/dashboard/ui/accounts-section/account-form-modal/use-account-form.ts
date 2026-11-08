import { useEffect, useState } from 'react';
import { Account, ACCOUNT_NAME_MAX_LENGTH, DEFAULT_ACCOUNT_ICON } from '@balance/dto/accounts';
import { CurrencyCode } from '@balance/dto/currencies';
import { Money, MoneyValidationError } from '@balance/domain/money';
import { useTranslation } from 'react-i18next';
import { currencyNameWithSymbol, useCurrencies } from '../../../../../entities/currency';
import { AccountsApi } from '../../../../../shared/api';
import { ApiError } from '../../../../../shared/api/api-error';
import { useAuth } from '../../../../../shared/auth';
import { usePreferences } from '../../../../../shared/preferences';
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
    readonly currencyUnavailable: boolean;
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
    const { locale } = usePreferences();
    const { user } = useAuth();
    const currencies = useCurrencies();

    const [name, setName] = useState('');
    const [icon, setIcon] = useState<IconName>(DEFAULT_ACCOUNT_ICON as IconName);
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('');
    const [initialBalance, setInitialBalance] = useState('0');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEdit = account !== null;

    const currencyItems: AccountCurrencyItem[] = currencies.items.map((item) => ({
        id: item.key,
        label: currencyNameWithSymbol(item, locale),
    }));

    const currencyUnavailable = currencies.loadState === 'error' && currencies.items.length === 0;

    useEffect(() => {
        if (!open) {
            return;
        }

        setError(null);
        setIsSubmitting(false);

        if (account) {
            setName(account.name);
            setIcon(coerceIconName(account.icon));
            setCurrencyCode(account.currency);
            setInitialBalance(account.initialBalance);
            return;
        }

        setName('');
        setIcon(coerceIconName(DEFAULT_ACCOUNT_ICON));
        setCurrencyCode('');
        setInitialBalance('0');
    }, [open, account]);

    useEffect(() => {
        if (!open || account || currencyCode) {
            return;
        }

        const preferred = user?.defaultCurrencyCode;

        if (preferred && currencies.items.some((item) => item.key === preferred)) {
            setCurrencyCode(preferred);
        }
    }, [open, account, currencyCode, currencies.items, user]);

    const submit = async (event?: { preventDefault(): void }) => {
        event?.preventDefault();
        setError(null);

        const trimmedName = name.trim();

        if (trimmedName.length < 1 || trimmedName.length > ACCOUNT_NAME_MAX_LENGTH) {
            setError(t('accounts.validation.name'));
            return;
        }

        if (!isEdit && !currencies.items.some((item) => item.key === currencyCode)) {
            setError(t('accounts.validation.currency'));
            return;
        }

        setIsSubmitting(true);

        try {
            const saved = await saveAccount({
                isEdit,
                account,
                name: trimmedName,
                icon,
                currency: currencyCode,
                initialBalance,
            });

            onSaved(saved);
            onClose();
        } catch (reason) {
            if (reason instanceof MoneyValidationError) {
                setError(t('accounts.validation.balance'));
                return;
            }

            setError(mapAccountSaveError(reason, t));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isEdit,
        name,
        icon,
        currency: currencyCode,
        initialBalance,
        currencyItems,
        currencyUnavailable,
        error,
        isSubmitting,
        setName,
        setIcon,
        setCurrency: (value: string) => {
            if (currencies.items.some((item) => item.key === value)) {
                setCurrencyCode(value);
            }
        },
        setInitialBalance,
        clearError: () => setError(null),
        submit,
    };
}

function saveAccount(input: {
    readonly isEdit: boolean;
    readonly account: Account | null;
    readonly name: string;
    readonly icon: IconName;
    readonly currency: string;
    readonly initialBalance: string;
}): Promise<Account> {
    if (input.isEdit && input.account) {
        return AccountsApi.updateAccount(input.account.id, {
            name: input.name,
            icon: input.icon,
            version: input.account.version,
        });
    }

    return AccountsApi.createAccount({
        name: input.name,
        currency: input.currency,
        initialBalance: Money.create(input.currency, input.initialBalance || '0').amount,
        icon: input.icon,
    });
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
