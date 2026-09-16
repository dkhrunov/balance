import { ComponentType } from 'react';
import { Finance, Settings, Wallet, Category } from '@carbon/react/icons';

export type AppNavItem = {
    id: string;
    label: string;
    path: string;
    icon: ComponentType;
};

/** Destinations for desktop SideNav. */
export const APP_NAV_ITEMS: AppNavItem[] = [
    { id: 'transactions', label: 'Transactions', path: '/transactions', icon: Finance },
    { id: 'accounts', label: 'Accounts', path: '/accounts', icon: Wallet },
    { id: 'categories', label: 'Categories', path: '/categories', icon: Category },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];
