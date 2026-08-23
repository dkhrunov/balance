import { type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Column,
    Content,
    Grid,
    Header,
    HeaderGlobalBar,
    HeaderName,
    OverflowMenu,
    OverflowMenuItem,
    SideNav,
    SideNavItems,
    SideNavLink,
    SkipToContent,
} from '@carbon/react';
import { UserAvatar } from '@carbon/react/icons';
import { breakpoints } from '@carbon/layout';
import { useMockSession } from '../auth/mock-session';
import { BalanceLogo } from './balance-logo';
import { APP_NAV_ITEMS } from './nav-items';
import { useOnlineStatus } from '../online/use-online-status';
import { useIsDesktop } from './use-is-desktop';
import styles from './layout.module.scss';

type LayoutProps = {
    children?: ReactNode;
};

export function Layout({ children }: LayoutProps) {
    const { logout } = useMockSession();
    const navigate = useNavigate();
    const location = useLocation();
    const online = useOnlineStatus();
    const isDesktop = useIsDesktop();

    const onLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const connectionClassName = [
        styles.connection,
        online ? styles.connectionStatusOnline : styles.connectionStatusOffline,
    ].join(' ');

    return (
        <div className={styles.root}>
            <Header aria-label="Balance">
                <SkipToContent />
                <HeaderName
                    as={Link}
                    to="/transactions"
                    prefix=""
                    className={styles.header}
                >
                    <BalanceLogo />
                    <span className={styles.headerLabel}>Balance</span>
                </HeaderName>
                <HeaderGlobalBar>
                    <div
                        className={connectionClassName}
                        role="status"
                        aria-label={online ? 'Online' : 'Offline'}
                    >
                        <span className={styles.connectionStatusDot} aria-hidden />
                        <span className={styles.connectionStatusLabel}>
                            {online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <OverflowMenu
                        flipped
                        renderIcon={UserAvatar}
                        iconDescription="Account"
                        aria-label="Account"
                        size="lg"
                        align="bottom-end"
                    >
                        <OverflowMenuItem
                            itemText="Profile"
                            onClick={() => navigate('/profile')}
                        />
                        <OverflowMenuItem
                            itemText="Settings"
                            onClick={() => navigate('/settings')}
                        />
                        <OverflowMenuItem
                            hasDivider
                            itemText="Log out"
                            onClick={onLogout}
                        />
                    </OverflowMenu>
                </HeaderGlobalBar>
            </Header>

            {
                isDesktop ? (
                    <SideNav
                        aria-label="Side navigation"
                        expanded
                        isFixedNav
                        isChildOfHeader
                    >
                        <SideNavItems>
                            {APP_NAV_ITEMS.map((item) => (
                                <SideNavLink
                                    key={item.id}
                                    as={NavLink}
                                    to={item.path}
                                    isActive={location.pathname.startsWith(item.path)}
                                >
                                    {item.label}
                                </SideNavLink>
                            ))}
                        </SideNavItems>
                    </SideNav>
                ) : null
            }

            <Content id="main-content">
                <Grid>
                    <Column
                        sm={breakpoints.sm.columns}
                        md={breakpoints.md.columns}
                        lg={breakpoints.lg.columns}
                    >
                        {children ?? <Outlet />}
                    </Column>
                </Grid>
            </Content>
        </div >
    );
}
