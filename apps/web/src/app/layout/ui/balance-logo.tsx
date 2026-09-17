import { useActiveTheme } from '../../../shared/preferences';
import styles from './layout.module.scss';

const LOGO_SRC = {
    light: '/balance-icon-light.png',
    dark: '/balance-icon-dark.png',
} as const;

export function BalanceLogo() {
    const theme = useActiveTheme();

    return (
        <img
            className={styles.headerLogo}
            src={LOGO_SRC[theme]}
            alt=""
            aria-hidden
        />
    );
}
