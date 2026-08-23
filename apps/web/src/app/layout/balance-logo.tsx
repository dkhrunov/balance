import { useActiveTheme } from '../theme/theme-preference';
import styles from './layout.module.scss';

const LOGO_SRC = {
    light: '/balance-icon-dark.png',
    dark: '/balance-icon-light.png',
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
