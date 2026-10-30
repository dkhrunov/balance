import { TextInput, TextInputProps } from '@carbon/react';
import { getCurrencySymbol } from '../../../lib/money';
import { MoneyInputMaskProps, useMoneyInputMask } from '../lib/use-money-input-mask';

export type MoneyInputProps = MoneyInputMaskProps &
    Pick<
        TextInputProps,
        | 'id'
        | 'labelText'
        | 'className'
        | 'disabled'
        | 'readOnly'
        | 'placeholder'
        | 'invalid'
        | 'invalidText'
        | 'warn'
        | 'warnText'
        | 'helperText'
    >;

/**
 * Default money amount field: Carbon {@link TextInput} + IMask.
 * For fluid stacks / modals use {@link FluidMoneyInput}.
 */
export function MoneyInput({
    value,
    onChange,
    currency,
    locale,
    prefix,
    ref,
    onFocus,
    onBlur,
    ...textInputProps
}: MoneyInputProps) {
    const { setInputRef, handleFocus, handleBlur } = useMoneyInputMask({
        value,
        onChange,
        currency,
        locale,
        prefix,
        ref,
        onFocus,
        onBlur,
    });

    return (
        <TextInput
            {...textInputProps}
            ref={setInputRef}
            inputMode="decimal"
            decorator={<span aria-hidden="true">{getCurrencySymbol(currency, locale)}</span>}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
}
