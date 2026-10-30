import { ReactNode, useId } from 'react';
import { FormItem, FormLabel } from '@carbon/react';
import {
    IconPickerControl,
    IconPickerControlProps,
} from './icon-picker-control';
import styles from './icon-picker.module.scss';

export type IconPickerProps = Omit<
    IconPickerControlProps,
    'aria-labelledby' | 'aria-label' | 'className'
> & {
    /**
     * Visible field label (Carbon FormLabel). Required — icon pickers in forms
     * always expose a label; use {@link hideLabel} only for rare a11y-reviewed cases.
     */
    readonly labelText: ReactNode;
    /** Visually hide the label while keeping it available to assistive tech. */
    readonly hideLabel?: boolean;
    /** Optional class on the outer {@link FormItem}. */
    readonly className?: string;
};

/**
 * Default (non-fluid) icon form control: Carbon FormItem + FormLabel + picker trigger.
 * Label spacing matches TextInput (`label-01`, `$spacing-03` below the label).
 */
export function IconPicker({
    labelText,
    hideLabel = false,
    className,
    ...controlProps
}: IconPickerProps) {
    const labelId = useId();

    return (
        <FormItem className={className ? `${styles.field} ${className}` : styles.field}>
            <FormLabel
                id={labelId}
                className={hideLabel ? styles.labelVisuallyHidden : undefined}
            >
                {labelText}
            </FormLabel>
            <IconPickerControl
                {...controlProps}
                aria-labelledby={labelId}
            />
        </FormItem>
    );
}

export { scopeIconCatalog } from './icon-picker-control';
