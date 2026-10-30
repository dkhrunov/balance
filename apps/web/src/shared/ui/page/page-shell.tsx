import { ReactNode } from 'react';
import styles from './page-shell.module.scss';

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
                    <h3 className={styles.title}>{title}</h3>
                    {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
                </div>
                {actions}
            </header>

            <main>
                {children}
            </main>
        </>
    );
}
