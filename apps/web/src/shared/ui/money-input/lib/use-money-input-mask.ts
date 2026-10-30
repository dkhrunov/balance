import { FocusEvent, FocusEventHandler, Ref, useEffect, useRef } from 'react';
import { CurrencyCode } from '@balance/dto/currencies';
import { Locale } from '@balance/dto/users';
import IMask, { InputMask } from 'imask';
import { canonicalAmountFromUnmasked, createMoneyMaskOptions, isSameMoneyAmount } from './money-mask';

/**
 * Shared money + mask contract for {@link MoneyInput}, {@link FluidMoneyInput}, and
 * {@link useMoneyInputMask}. Canonical amount in/out; display formatting is internal.
 */
export type MoneyInputMaskProps = {
    /**
     * Canonical decimal amount (`Money.amount`) or empty string while blank.
     * Display formatting (grouping) is owned by IMask on the Carbon input.
     */
    readonly value: string;
    /**
     * Called with a canonical amount string, or `''` when the field is cleared.
     * Differs from Carbon TextInput `onChange` (DOM event).
     */
    readonly onChange: (value: string) => void;
    /** Currency used for decimal precision, parsing/formatting, and the field decorator symbol. */
    readonly currency: CurrencyCode;
    /** App locale for thousand/decimal separators while typing. */
    readonly locale: Locale;
    /**
     * Optional leading display prefix inside the field via IMask Pattern (e.g. `−` for expenses).
     * Never included in {@link value} / `onChange` — only `unmaskedValue` is canonicalized.
     */
    readonly prefix?: string;
    /** Ref to the underlying `<input>` (React 19 `ref` prop). */
    readonly ref?: Ref<HTMLInputElement>;
    readonly onFocus?: FocusEventHandler<HTMLInputElement>;
    readonly onBlur?: FocusEventHandler<HTMLInputElement>;
};

/**
 * Values returned by {@link useMoneyInputMask} for wiring a Carbon text input.
 */
export type UseMoneyInputMaskResult = {
    /** Callback ref that attaches IMask and forwards the consumer `ref`. */
    readonly setInputRef: (node: HTMLInputElement | null) => void;
    /** Focus handler: marks the field focused and calls the consumer `onFocus`. */
    readonly handleFocus: FocusEventHandler<HTMLInputElement>;
    /** Blur handler: canonicalizes the amount, then calls the consumer `onBlur`. */
    readonly handleBlur: FocusEventHandler<HTMLInputElement>;
};

/**
 * Owns IMask lifecycle for money fields: locale grouping, canonical emit, and
 * currency/prefix mask options. Shared by {@link MoneyInput} and {@link FluidMoneyInput}.
 */
export function useMoneyInputMask({
    value,
    onChange,
    currency,
    locale,
    prefix,
    ref,
    onFocus,
    onBlur,
}: MoneyInputMaskProps): UseMoneyInputMaskResult {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const maskRef = useRef<InputMask | null>(null);
    const onChangeRef = useRef(onChange);
    const valueRef = useRef(value);
    const isFocusedRef = useRef(false);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const setInputRef = (node: HTMLInputElement | null) => {
        inputRef.current = node;

        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    };

    useEffect(() => {
        const input = inputRef.current;

        if (!input) {
            return;
        }

        const mask = IMask(input, createMoneyMaskOptions(currency, locale, prefix));
        maskRef.current = mask;

        if (valueRef.current) {
            mask.unmaskedValue = valueRef.current;
        } else {
            mask.unmaskedValue = '';
        }

        const onAccept = () => {
            const next = canonicalAmountFromUnmasked(mask.unmaskedValue, currency);

            if (next === null) {
                return;
            }

            if (next !== valueRef.current) {
                onChangeRef.current(next);
            }
        };

        mask.on('accept', onAccept);

        return () => {
            mask.off('accept', onAccept);
            mask.destroy();
            maskRef.current = null;
        };
    }, [currency, locale, prefix]);

    useEffect(() => {
        const mask = maskRef.current;

        if (!mask || isFocusedRef.current) {
            return;
        }

        if (isSameMoneyAmount(mask.unmaskedValue, value, currency)) {
            return;
        }

        mask.unmaskedValue = value;
    }, [value, currency]);

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = true;
        onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = false;

        const mask = maskRef.current;

        if (mask) {
            const next = canonicalAmountFromUnmasked(mask.unmaskedValue, currency);

            if (next !== null) {
                if (next !== valueRef.current) {
                    onChangeRef.current(next);
                }

                mask.unmaskedValue = next;
            }
        }

        onBlur?.(event);
    };

    return {
        setInputRef,
        handleFocus,
        handleBlur,
    };
}
