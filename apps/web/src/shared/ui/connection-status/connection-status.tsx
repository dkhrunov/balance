import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../lib';
import styles from './connection-status.module.scss';

type ConnectionStatusProps = {
    /** Optional class name for layout spacing in the host. */
    readonly className?: string;
};

/**
 * Live online/offline indicator based on browser connectivity events.
 */
export function ConnectionStatus({ className }: ConnectionStatusProps) {
    const { t } = useTranslation();
    const online = useOnlineStatus();

    const rootClassName = [
        styles.root,
        online ? styles.online : styles.offline,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={rootClassName}
            role="status"
            aria-label={online ? t('common.online') : t('common.offline')}
        >
            <span className={styles.dot} aria-hidden />
            <span className={styles.label}>
                {online ? t('common.online') : t('common.offline')}
            </span>
        </div>
    );
}
