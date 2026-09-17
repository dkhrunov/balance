import styles from './divider.module.scss';

type DividerProps = {
    /** Layout orientation of the rule. Defaults to vertical. */
    readonly orientation?: 'vertical' | 'horizontal';
    /** Optional class name for host layout tweaks. */
    readonly className?: string;
};

/**
 * Decorative separator with Carbon spacing around the rule.
 * Matches the former preference-controls gap (`$spacing-03`) on each side.
 */
export function Divider({ orientation = 'vertical', className }: DividerProps) {
    const rootClassName = [
        styles.root,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <span className={rootClassName} role="separator" aria-orientation={orientation} />;
}
