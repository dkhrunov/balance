import { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Column,
    Content,
    Grid,
    Header,
    HeaderContainer,
    HeaderGlobalBar,
    HeaderMenuButton,
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
import { useAuth } from '../../../shared/auth';
import { useIsDesktop, useOnlineStatus } from '../../../shared/lib';
import { APP_NAV_ITEMS } from '../config/nav-items';
import { BalanceLogo } from './balance-logo';
import styles from './layout.module.scss';

type LayoutProps = {
    children?: ReactNode;
};

export function Layout({ children }: LayoutProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const online = useOnlineStatus();
    const isDesktop = useIsDesktop();

    const onLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const onSideNavLinkClick = (isSideNavExpanded: boolean, onClickSideNavExpand: () => void) => {
        if (!isDesktop && isSideNavExpanded) {
            onClickSideNavExpand();
        }
    };

    const onClickProfile = () => {
        navigate('/profile');
    };

    const onClickSettings = () => {
        navigate('/settings');
    };

    const connectionClassName = [
        styles.connection,
        online ? styles.connectionStatusOnline : styles.connectionStatusOffline,
    ].join(' ');

    return (
        <div className={styles.root}>
            <HeaderContainer
                render={({ isSideNavExpanded, onClickSideNavExpand }) => (
                    <>
                        <Header aria-label="Balance">
                            <SkipToContent />
                            <HeaderMenuButton
                                aria-label={
                                    isSideNavExpanded ? 'Close menu' : 'Open menu'
                                }
                                onClick={onClickSideNavExpand}
                                isActive={isSideNavExpanded}
                                aria-expanded={isSideNavExpanded}
                                isCollapsible
                            />
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
                                    <span
                                        className={styles.connectionStatusDot}
                                        aria-hidden
                                    />
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
                                        onClick={onClickProfile}
                                    />
                                    <OverflowMenuItem
                                        itemText="Settings"
                                        onClick={onClickSettings}
                                    />
                                    <OverflowMenuItem
                                        hasDivider
                                        itemText="Log out"
                                        onClick={onLogout}
                                    />
                                </OverflowMenu>
                            </HeaderGlobalBar>
                        </Header>

                        <SideNav
                            aria-label="Side navigation"
                            isRail
                            expanded={isSideNavExpanded}
                            addMouseListeners={false}
                            onSideNavBlur={onClickSideNavExpand}
                            onOverlayClick={onClickSideNavExpand}
                            href="#main-content"
                        >
                            <SideNavItems>
                                {APP_NAV_ITEMS.map((item) => (
                                    <SideNavLink
                                        key={item.id}
                                        as={NavLink}
                                        to={item.path}
                                        renderIcon={item.icon}
                                        isActive={location.pathname.startsWith(item.path)}
                                        onClick={() => onSideNavLinkClick(isSideNavExpanded, onClickSideNavExpand)}
                                    >
                                        {item.label}
                                    </SideNavLink>
                                ))}
                            </SideNavItems>
                        </SideNav>

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
                    </>
                )}
            />
        </div>
    );
}
