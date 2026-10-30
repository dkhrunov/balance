import {
    IconPickerControl,
    IconPickerControlProps,
} from '../icon-picker/icon-picker-control';
import styles from './fluid-icon-picker.module.scss';

export type FluidIconPickerProps = Omit<
    IconPickerControlProps,
    'aria-labelledby' | 'aria-label' | 'className' | 'kind'
> & {
    /**
     * Accessible name for the trigger (no visible label).
     * IconButton `md` does not fit under a Carbon-style inset label inside the
     * 64px fluid field, so the label is aria-only — the glyph is the affordance.
     */
    readonly labelText: string;
    /** Optional class on the outer fluid field. */
    readonly className?: string;
};

/**
 * Fluid-height icon form control for flush fluid modals / stacks.
 * Matches FluidTextInput field height (64px) and `$field-01` fill; trigger uses
 * ghost {@link IconButton}.
 */
export function FluidIconPicker({
    labelText,
    className,
    ...controlProps
}: FluidIconPickerProps) {
    return (
        <div className={className ? `${styles.field} ${className}` : styles.field}>
            <IconPickerControl
                {...controlProps}
                kind="ghost"
                className={styles.control}
                aria-label={labelText}
            />
        </div>
    );
}
