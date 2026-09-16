import { ReactNode } from 'react';
import styles from './page.module.scss';

type PageShellProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children?: ReactNode;
};

/**
 * Shared page chrome: title, optional subtitle/actions, and content slot.
 */
export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
    return (
        <>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>{title}</h2>
                    {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
                </div>
                {actions}
            </header>
            {children}
        </>
    );
}
