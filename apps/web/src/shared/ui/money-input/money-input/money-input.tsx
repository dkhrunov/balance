import { TextInput, TextInputProps } from '@carbon/react';
import { MoneyInputMaskProps, useMoneyInputMask } from '../lib/use-money-input-mask';

export type MoneyInputProps = MoneyInputMaskProps & {
    /** Display symbol for {@link MoneyInputMaskProps.currency}, supplied by the caller. */
    readonly symbol: string;
} &
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
    symbol,
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
            decorator={<span aria-hidden="true">{symbol}</span>}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
}
