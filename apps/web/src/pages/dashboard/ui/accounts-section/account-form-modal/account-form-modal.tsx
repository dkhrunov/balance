import {
    ComposedModal,
    FluidDropdown,
    FluidTextInput,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
    OnChangeData,
} from '@carbon/react';
import { Account } from '@balance/dto/accounts';
import { useTranslation } from 'react-i18next';
import { useCurrencies } from '../../../../../entities/currency';
import { usePreferences } from '../../../../../shared/preferences';
import { FluidIconPicker } from '../../../../../shared/ui/icon';
import { FluidMoneyInput } from '../../../../../shared/ui/money-input';
import { AccountCurrencyItem, useAccountForm } from './use-account-form';
import styles from './account-form-modal.module.scss';

type AccountFormModalProps = {
    readonly open: boolean;
    readonly account: Account | null;
    readonly onClose: () => void;
    readonly onSaved: (account: Account) => void;
};

/**
 * Create/edit account form in a transactional ComposedModal.
 */
export function AccountFormModal({ open, account, onClose, onSaved }: AccountFormModalProps) {
    const { t } = useTranslation();
    const { locale } = usePreferences();
    const currencies = useCurrencies();
    const form = useAccountForm({ open, account, onClose, onSaved });

    return (
        <ComposedModal
            open={open}
            size="sm"
            isFullWidth
            onClose={() => !form.isSubmitting && onClose()}
            preventCloseOnClickOutside={form.isSubmitting}
        >
            <ModalHeader
                title={form.isEdit ? t('accounts.editTitle') : t('accounts.createTitle')}
                label={t('accounts.title')}
            />
            <ModalBody hasForm>
                <form
                    id="account-form"
                    onSubmit={(event) => {
                        void form.submit(event);
                    }}
                    noValidate
                >
                    {form.currencyUnavailable ? (
                        <InlineNotification
                            kind="error"
                            title={t('accounts.cannotLoad')}
                            subtitle={t('accounts.currencyLoadError')}
                            lowContrast
                            hideCloseButton
                        />
                    ) : null}

                    {form.error ? (
                        <InlineNotification
                            kind="error"
                            title={t('accounts.cannotSave')}
                            subtitle={form.error}
                            lowContrast
                            hideCloseButton
                        />
                    ) : null}

                    <div className={styles.iconNameRow}>
                        <FluidIconPicker
                            labelText={t('accounts.fields.icon')}
                            value={form.icon}
                            disabled={form.isSubmitting}
                            onChange={(next) => {
                                form.setIcon(next);
                                form.clearError();
                            }}
                        />
                        <div className={styles.nameField}>
                            <FluidTextInput
                                id="account-name"
                                labelText={t('accounts.fields.name')}
                                value={form.name}
                                disabled={form.isSubmitting}
                                onChange={(event) => {
                                    form.setName(event.target.value);
                                    form.clearError();
                                }}
                            />
                        </div>
                    </div>

                    {!form.isEdit ? (
                        <>
                            {form.currency ? (
                                <FluidMoneyInput
                                    id="account-initial-balance"
                                    labelText={t('accounts.fields.initialBalance')}
                                    value={form.initialBalance}
                                    currency={form.currency}
                                    symbol={currencies.symbol(form.currency)}
                                    locale={locale}
                                    disabled={form.isSubmitting}
                                    onChange={form.setInitialBalance}
                                />
                            ) : null}
                            <FluidDropdown
                                id="account-currency"
                                titleText={t('accounts.fields.currency')}
                                label={t('accounts.fields.currency')}
                                items={form.currencyItems}
                                itemToString={(item: AccountCurrencyItem) => item?.label ?? ''}
                                selectedItem={
                                    form.currencyItems.find((item) => item.id === form.currency)
                                }
                                disabled={form.isSubmitting || form.currencyUnavailable}
                                onChange={({ selectedItem }: OnChangeData<AccountCurrencyItem>) => {
                                    if (selectedItem) {
                                        form.setCurrency(selectedItem.id);
                                        form.clearError();
                                    }
                                }}
                            />
                        </>
                    ) : null}
                </form>
            </ModalBody>
            <ModalFooter
                primaryButtonText={
                    form.isEdit ? t('accounts.actions.save') : t('accounts.actions.create')
                }
                secondaryButtonText={t('accounts.actions.cancel')}
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
