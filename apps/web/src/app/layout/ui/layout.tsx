import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    Column,
    Content,
    Grid,
    Header,
    HeaderContainer,
    HeaderGlobalBar,
    HeaderMenuButton,
    HeaderName,
    SideNav,
    SideNavItems,
    SideNavLink,
    SkipToContent,
} from '@carbon/react';
import { breakpoints } from '@carbon/layout';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../../shared/lib';
import { APP_NAV_ITEMS, ROUTES } from '../../../shared/routes';
import { AppLogo } from '../../../shared/ui/app-logo';
import { Divider } from '../../../shared/ui/divider';
import { HeaderAccountActions } from './header-account-actions';
import { HeaderLocaleActions } from './header-locale-actions';
import { HeaderThemeActions } from './header-theme-actions';
import styles from './layout.module.scss';
import { HeaderContainerRenderProps } from '@carbon/react/lib/components/UIShell/HeaderContainer';

/**
 * Stable HeaderContainer child. Must stay a module-level component identity —
 * Carbon mounts `render` as a component type, so an inline arrow remounts the
 * whole shell (and route pages) on every Layout re-render.
 *
 * SideNav lives inside {@link Header} (Carbon SideNav-rail-with-header pattern)
 * so `.cds--side-nav ~ .cds--content` does not reserve left margin while the
 * overlay/hidden nav has `inline-size: 0`. Desktop rail offset is applied
 * explicitly on {@link Content} instead.
 */
function Shell({ isSideNavExpanded, onClickSideNavExpand }: HeaderContainerRenderProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const isDesktop = useIsDesktop();

    const closeOverlayNav = () => {
        // Overlay mode only (< lg): close after navigation so content is not covered.
        // Desktop rail stays as the user left it.
        if (!isDesktop && isSideNavExpanded) {
            onClickSideNavExpand();
        }
    };

    return (
        <>
            <Header aria-label={t('common.appName')}>
                <SkipToContent />

                <HeaderMenuButton
                    aria-label={isSideNavExpanded ? t('nav.closeMenu') : t('nav.openMenu')}
                    onClick={onClickSideNavExpand}
                    isActive={isSideNavExpanded}
                    aria-expanded={isSideNavExpanded}
                    isCollapsible
                />

                <HeaderName as={Link} to={ROUTES.home} prefix="" className={styles.header}>
                    <AppLogo />
                    <span className={styles.headerLabel}>{t('common.appName')}</span>
                </HeaderName>

                <HeaderGlobalBar>
                    <HeaderLocaleActions />
                    <Divider />
                    <HeaderThemeActions />
                    <Divider />
                    <HeaderAccountActions />
                </HeaderGlobalBar>

                <SideNav
                    aria-label={t('nav.sideNav')}
                    isRail={isDesktop}
                    isPersistent={isDesktop}
                    expanded={isSideNavExpanded}
                    addMouseListeners={isDesktop}
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
                                isActive={
                                    item.path === ROUTES.home
                                        ? location.pathname === ROUTES.home
                                        : location.pathname.startsWith(item.path)
                                }
                                onClick={closeOverlayNav}
                            >
                                {t(item.labelKey)}
                            </SideNavLink>
                        ))}
                    </SideNavItems>
                </SideNav>
            </Header>

            <Content
                id="main-content"
                className={isDesktop ? styles.contentWithRail : undefined}
            >
                <Grid>
                    <Column
                        sm={breakpoints.sm.columns}
                        md={breakpoints.md.columns}
                        lg={breakpoints.lg.columns}
                    >
                        <Outlet />
                    </Column>
                </Grid>
            </Content>
        </>
    );
}

/**
 * Authenticated app shell: header, side nav, and the active route outlet.
 */
export function Layout() {
    return (
        <div className={styles.root}>
            <HeaderContainer render={Shell} />
        </div>
    );
}
