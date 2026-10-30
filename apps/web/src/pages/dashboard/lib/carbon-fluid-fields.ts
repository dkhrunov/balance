import {
    DatePickerProps,
    FluidDatePicker,
    FluidDatePickerProps,
    FluidDropdown,
    FluidDropdownProps,
} from '@carbon/react';
import { ReactNode } from 'react';

// HACK: Carbon FluidDatePicker `.d.ts` only lists a few props; runtime forwards DatePicker
// passthroughs (`datePickerType`, `dateFormat`, `value`, `onChange`, …). Cast until Carbon types catch up.
export type FluidDatePickerFieldProps = FluidDatePickerProps &
    Pick<
        DatePickerProps,
        'datePickerType' | 'dateFormat' | 'value' | 'onChange' | 'children' | 'className'
    >;

/** Typed FluidDatePicker with DatePicker passthrough props. */
export const FluidDatePickerField = FluidDatePicker as (
    props: FluidDatePickerFieldProps,
) => ReactNode;

// HACK: Carbon exports FluidDropdown as `FluidDropdownProps<unknown>`; restore the item generic
// so `selectedItem` / `items` stay typed instead of `unknown`.
export const FluidTypedDropdown = FluidDropdown as <ItemType>(
    props: FluidDropdownProps<ItemType>,
) => ReactNode;
