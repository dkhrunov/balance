import { ComponentType } from 'react';
import { Finance, Settings, Wallet, Category } from '@carbon/react/icons';

export type AppNavItem = {
    id: string;
    labelKey: string;
    path: string;
    icon: ComponentType;
};

/** Destinations for desktop SideNav (labels via i18n keys). */
export const APP_NAV_ITEMS: AppNavItem[] = [
    { id: 'transactions', labelKey: 'nav.transactions', path: '/transactions', icon: Finance },
    { id: 'accounts', labelKey: 'nav.accounts', path: '/accounts', icon: Wallet },
    { id: 'categories', labelKey: 'nav.categories', path: '/categories', icon: Category },
    { id: 'settings', labelKey: 'nav.settings', path: '/settings', icon: Settings },
];
