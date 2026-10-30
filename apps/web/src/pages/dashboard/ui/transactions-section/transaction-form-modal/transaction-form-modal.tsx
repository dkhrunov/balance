import {
    ComposedModal,
    FluidDatePickerInput,
    FluidTextArea,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { Category } from '@balance/dto/categories';
import {
    TRANSACTION_DESCRIPTION_MAX_LENGTH,
    IncomeExpenseType,
    Transaction,
} from '@balance/dto/transactions';
import { FormEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FluidDatePickerField,
    FluidTypedDropdown,
} from '../../../lib/carbon-fluid-fields';
import { toIsoDate } from '../../../lib/iso-date';
import {
    TransactionCategoryItem,
    useTransactionForm,
} from './use-transaction-form';
import { usePreferences } from '../../../../../shared/preferences';
import { Icon } from '../../../../../shared/ui/icon';
import { FluidMoneyInput } from '../../../../../shared/ui/money-input';
import styles from './transaction-form-modal.module.scss';

type TransactionFormModalProps = {
    readonly open: boolean;
    readonly type: IncomeExpenseType;
    readonly transaction: Transaction | null;
    readonly account: Account;
    readonly categories: readonly Category[];
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

/**
 * Create/edit modal for income or expense on the selected account.
 * Fluid controls + ComposedModal `isFullWidth` (Carbon “Fluid Modal”).
 * Type is chosen outside (MenuButton); expense amounts show a leading minus.
 */
export function TransactionFormModal({
    open,
    type,
    transaction,
    account,
    categories,
    onClose,
    onSaved,
}: TransactionFormModalProps) {
    const { t } = useTranslation();
    const { locale } = usePreferences();
    const form = useTransactionForm({
        open,
        type,
        transaction,
        account,
        categories,
        onClose,
        onSaved,
    });

    const renderCategoryItem = (item: TransactionCategoryItem | null): NonNullable<ReactNode> => {
        return item ? (
            <span className={styles.categoryOption}>
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
            </span>
        ) : (
            <span />
        );
    };

    const handleFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        void form.submit(event);
    };

    return (
        <ComposedModal
            open={open}
            size="sm"
            isFullWidth
            onClose={() => !form.isSubmitting && onClose()}
            preventCloseOnClickOutside={form.isSubmitting}
        >
            <ModalHeader title={form.title} label={account.name} />
            <ModalBody hasForm>
                <form id="transaction-form" onSubmit={handleFormSubmit} noValidate>
                    {form.error ? (
                        <InlineNotification
                            kind="error"
                            title={t('transactions.cannotSave')}
                            subtitle={form.error}
                            lowContrast
                            hideCloseButton
                        />
                    ) : null}
                    <FluidTypedDropdown<TransactionCategoryItem>
                        id="transaction-category"
                        titleText={t('transactions.fields.category')}
                        label={t('transactions.fields.category')}
                        items={form.categoryItems}
                        itemToString={(item) => item?.label ?? ''}
                        itemToElement={renderCategoryItem}
                        renderSelectedItem={renderCategoryItem}
                        selectedItem={
                            form.categoryItems.find((item) => item.id === form.categoryId) ??
                            undefined
                        }
                        disabled={form.isSubmitting || form.categoryItems.length === 0}
                        onChange={({ selectedItem }) => {
                            form.setCategoryId(selectedItem?.id ?? null);
                            form.clearError();
                        }}
                    />
                    <FluidMoneyInput
                        id="transaction-amount"
                        labelText={t('transactions.fields.amount')}
                        value={form.amount}
                        currency={account.currency}
                        locale={locale}
                        prefix={form.type === 'EXPENSE' ? '− ' : undefined}
                        disabled={form.isSubmitting}
                        onChange={form.setAmount}
                    />
                    <FluidDatePickerField
                        datePickerType="single"
                        dateFormat="Y-m-d"
                        value={form.transactionDate}
                        onChange={(dates: Date[]) => {
                            const next = dates[0];

                            if (next) {
                                form.setTransactionDate(toIsoDate(next));
                                form.clearError();
                            }
                        }}
                    >
                        <FluidDatePickerInput
                            id="transaction-date"
                            labelText={t('transactions.fields.date')}
                            placeholder="yyyy-mm-dd"
                            disabled={form.isSubmitting}
                        />
                    </FluidDatePickerField>
                    <FluidTextArea
                        id="transaction-description"
                        labelText={t('transactions.fields.description')}
                        value={form.description}
                        maxCount={TRANSACTION_DESCRIPTION_MAX_LENGTH}
                        enableCounter
                        disabled={form.isSubmitting}
                        onChange={(event) => {
                            form.setDescription(event.target.value);
                            form.clearError();
                        }}
                    />
                </form>
            </ModalBody>
            <ModalFooter
                primaryButtonText={
                    transaction ? t('transactions.actions.edit') : t('transactions.actions.create')
                }
                secondaryButtonText={t('transactions.actions.cancel')}
                primaryButtonDisabled={form.isSubmitting}
                loadingStatus={form.isSubmitting ? 'active' : 'inactive'}
                loadingDescription={t('common.loading')}
                onRequestSubmit={() => {
                    void form.submit();
                }}
                onRequestClose={onClose}
            >
                {null}
            </ModalFooter>
        </ComposedModal>
    );
}
