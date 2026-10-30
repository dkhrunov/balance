import { ComponentType } from 'react';
import { Dashboard, Settings } from '@carbon/react/icons';
import { AppRoute, ROUTES } from './paths';

/** SideNav destination: path, i18n label, Carbon icon. */
export type AppNavItem = {
    id: string;
    labelKey: string;
    path: AppRoute;
    icon: ComponentType;
};

/** Destinations for desktop SideNav (labels via i18n keys). */
export const APP_NAV_ITEMS: readonly AppNavItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', path: ROUTES.home, icon: Dashboard },
    { id: 'settings', labelKey: 'nav.settings', path: ROUTES.settings, icon: Settings },
];
