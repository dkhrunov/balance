import {
    ComposedModal,
    FluidDatePickerInput,
    FluidTextArea,
    FluidTextInput,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import {
    TRANSACTION_DESCRIPTION_MAX_LENGTH,
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
    TransferAccountItem,
    useTransferForm,
} from './use-transfer-form';
import { usePreferences } from '../../../../../shared/preferences';
import { Icon } from '../../../../../shared/ui/icon';
import { FluidMoneyInput } from '../../../../../shared/ui/money-input';
import styles from './transfer-form-modal.module.scss';

type TransferFormModalProps = {
    readonly open: boolean;
    readonly transaction: Transaction | null;
    readonly account: Account;
    readonly onClose: () => void;
    readonly onSaved: () => void;
};

/**
 * Create/edit modal for same-currency transfers involving the selected account.
 * Fluid controls + ComposedModal `isFullWidth` (Carbon “Fluid Modal”).
 * Create is always outbound (`TRANSFER_OUT`); edit preserves `TRANSFER_IN` / `TRANSFER_OUT`.
 */
export function TransferFormModal({
    open,
    transaction,
    account,
    onClose,
    onSaved,
}: TransferFormModalProps) {
    const { t } = useTranslation();
    const { locale } = usePreferences();
    const form = useTransferForm({
        open,
        transaction,
        account,
        onClose,
        onSaved,
    });

    const isOutbound = form.type === 'TRANSFER_OUT';

    const renderAccountItem = (item: TransferAccountItem | null): NonNullable<ReactNode> => {
        return item ? (
            <span className={styles.accountOption}>
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
                <form id="transfer-form" onSubmit={handleFormSubmit} noValidate>
                    {form.error ? (
                        <InlineNotification
                            kind="error"
                            title={t('transactions.cannotSave')}
                            subtitle={form.error}
                            lowContrast
                            hideCloseButton
                        />
                    ) : null}
                    <FluidTextInput
                        id="transfer-this-account"
                        labelText={
                            isOutbound
                                ? t('transactions.fields.fromAccount')
                                : t('transactions.fields.toAccount')
                        }
                        value={account.name}
                        readOnly
                    />
                    <FluidTypedDropdown<TransferAccountItem>
                        id="transfer-other-account"
                        titleText={
                            isOutbound
                                ? t('transactions.fields.toAccount')
                                : t('transactions.fields.fromAccount')
                        }
                        label={t('transactions.fields.toAccount')}
                        items={form.transferTargets}
                        itemToString={(item) => item?.label ?? ''}
                        itemToElement={renderAccountItem}
                        selectedItem={
                            form.transferTargets.find(
                                (item) => item.id === form.otherAccountId,
                            ) ?? undefined
                        }
                        renderSelectedItem={renderAccountItem}
                        disabled={form.isSubmitting || form.transferTargets.length === 0}
                        onChange={({ selectedItem }) => {
                            form.setOtherAccountId(selectedItem?.id ?? null);
                            form.clearError();
                        }}
                    />
                    {form.transferTargets.length === 0 ? (
                        <InlineNotification
                            kind="info"
                            title={t('transactions.noTransferTargetsTitle')}
                            subtitle={t('transactions.noTransferTargets')}
                            lowContrast
                            hideCloseButton
                        />
                    ) : null}
                    <FluidMoneyInput
                        id="transfer-amount"
                        labelText={t('transactions.fields.amount')}
                        value={form.amount}
                        currency={account.currency}
                        locale={locale}
                        prefix={isOutbound ? '− ' : undefined}
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
                            id="transfer-date"
                            labelText={t('transactions.fields.date')}
                            placeholder="yyyy-mm-dd"
                            disabled={form.isSubmitting}
                        />
                    </FluidDatePickerField>
                    <FluidTextArea
                        id="transfer-description"
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
