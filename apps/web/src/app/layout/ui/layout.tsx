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
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../shared/auth';
import { useIsDesktop } from '../../../shared/lib';
import {
    HeaderLocaleActions,
    HeaderThemeActions,
    usePreferences,
} from '../../../shared/preferences';
import { Divider } from '../../../shared/ui/divider';
import { APP_NAV_ITEMS } from '../config/nav-items';
import { BalanceLogo } from './balance-logo';
import styles from './layout.module.scss';

type LayoutProps = {
    children?: ReactNode;
};

export function Layout({ children }: LayoutProps) {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const { locale, theme, setLocale, setTheme } = usePreferences();
    const navigate = useNavigate();
    const location = useLocation();
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

    return (
        <div className={styles.root}>
            <HeaderContainer
                render={({ isSideNavExpanded, onClickSideNavExpand }) => (
                    <>
                        <Header aria-label={t('common.appName')}>
                            <SkipToContent />
                            <HeaderMenuButton
                                aria-label={
                                    isSideNavExpanded ? t('nav.closeMenu') : t('nav.openMenu')
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
                                <span className={styles.headerLabel}>{t('common.appName')}</span>
                            </HeaderName>
                            <HeaderGlobalBar>
                                <HeaderLocaleActions
                                    locale={locale}
                                    onChange={setLocale}
                                />
                                <Divider />
                                <HeaderThemeActions
                                    theme={theme}
                                    onChange={setTheme}
                                />
                                <Divider />
                                <OverflowMenu
                                    flipped
                                    renderIcon={UserAvatar}
                                    iconDescription={t('nav.account')}
                                    aria-label={t('nav.account')}
                                    size="lg"
                                    align="bottom-end"
                                >
                                    <OverflowMenuItem
                                        itemText={t('nav.profile')}
                                        onClick={onClickProfile}
                                    />
                                    <OverflowMenuItem
                                        itemText={t('nav.settings')}
                                        onClick={onClickSettings}
                                    />
                                    <OverflowMenuItem
                                        hasDivider
                                        itemText={t('nav.logOut')}
                                        onClick={onLogout}
                                    />
                                </OverflowMenu>
                            </HeaderGlobalBar>
                        </Header>

                        <SideNav
                            aria-label={t('nav.sideNav')}
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
                                        {t(item.labelKey)}
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
