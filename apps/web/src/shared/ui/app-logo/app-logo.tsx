import { useActiveTheme } from '../../theme';
import styles from './app-logo.module.scss';

const LOGO_SRC = {
    light: '/balance-icon-light.png',
    dark: '/balance-icon-dark.png',
} as const;

type AppLogoProps = {
    /** Optional extra class for sizing/placement in a parent layout. */
    readonly className?: string;
};

/**
 * Brand mark that switches light/dark assets with the active theme.
 */
export function AppLogo({ className }: AppLogoProps) {
    const theme = useActiveTheme();
    const classNames = className ? `${styles.logo} ${className}` : styles.logo;

    return (
        <img
            className={classNames}
            src={LOGO_SRC[theme]}
            alt=""
            aria-hidden
        />
    );
}
