import { ComponentType } from 'react';
import { Dashboard, Settings } from '@carbon/react/icons';

export type AppNavItem = {
    id: string;
    labelKey: string;
    path: string;
    icon: ComponentType;
};

/** Destinations for desktop SideNav (labels via i18n keys). */
export const APP_NAV_ITEMS: AppNavItem[] = [
    { id: 'dashboard', labelKey: 'nav.dashboard', path: '/', icon: Dashboard },
    { id: 'settings', labelKey: 'nav.settings', path: '/settings', icon: Settings },
];
