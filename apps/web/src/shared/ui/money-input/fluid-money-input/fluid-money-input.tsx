import { ComponentProps, FocusEventHandler, ReactNode, Ref } from 'react';
import { FluidTextInput, FluidTextInputProps } from '@carbon/react';
import { MoneyInputMaskProps, useMoneyInputMask } from '../lib/use-money-input-mask';

export type FluidMoneyInputProps = MoneyInputMaskProps & {
    /** Display symbol for {@link MoneyInputMaskProps.currency}, supplied by the caller. */
    readonly symbol: string;
} &
    Pick<
        FluidTextInputProps,
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
    >;

// HACK: Carbon FluidTextInput at runtime forwards unknown props to TextInput, but its
// TypeScript types omit decorator, inputMode, and focus handlers. Cast until Carbon types catch up.
type FluidTextInputFieldProps = FluidTextInputProps & {
    readonly decorator?: ReactNode;
    readonly inputMode?: ComponentProps<'input'>['inputMode'];
    readonly onFocus?: FocusEventHandler<HTMLInputElement>;
    readonly onBlur?: FocusEventHandler<HTMLInputElement>;
    readonly ref?: Ref<HTMLInputElement>;
};

const FluidTextInputField = FluidTextInput as (props: FluidTextInputFieldProps) => ReactNode;

/**
 * Fluid money amount field: Carbon {@link FluidTextInput} + IMask.
 * For default (non-fluid) forms use {@link MoneyInput}.
 */
export function FluidMoneyInput({
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
}: FluidMoneyInputProps) {
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
        <FluidTextInputField
            {...textInputProps}
            ref={setInputRef}
            inputMode="decimal"
            decorator={<span aria-hidden="true">{symbol}</span>}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
}
